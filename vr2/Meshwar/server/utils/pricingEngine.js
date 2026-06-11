import PricingRule from "../models/PricingRule.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import OpenAI from 'openai';

// Initialize Groq client using OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

/**
 * Calculate the dynamic price for a car rental using AI Strategy
 */
export const calculateDynamicPrice = async ({ carId, pickupDate, returnDate }) => {
    const car = await Car.findById(carId);
    if (!car) throw new Error("Car not found");

    const basePrice = car.pricePerDay;
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24)) || 1;

    // Get pricing rules
    let rules = await PricingRule.findOne({ car: carId, isActive: true });
    if (!rules) {
        rules = await PricingRule.findOne({ owner: car.owner, car: null, isActive: true });
    }

    // --- 1. Gather Market Context ---
    const totalCarsInLocation = await Car.countDocuments({ location: car.location, isAvaliable: true });
    const bookedCarsInLocation = await Booking.countDocuments({
        status: { $in: ['confirmed', 'pending'] },
        pickupDate: { $lte: returnD },
        returnDate: { $gte: pickup }
    });
    const bookingRate = totalCarsInLocation > 0 ? (bookedCarsInLocation / totalCarsInLocation) : 0;
    const totalHistoricalBookings = await Booking.countDocuments({ car: carId, status: 'confirmed' });

    // --- 2. Build Context for AI ---
    const contextStr = `
CAR DETAILS:
- Brand/Model: ${car.brand} ${car.model} (${car.year})
- Category: ${car.category}
- Transmission: ${car.transmission}
- Fuel Type: ${car.fuel_type}
- Base Price: ${basePrice} EGP/day
- Popularity: ${totalHistoricalBookings} past bookings

MARKET DEMAND (Location: ${car.location}):
- Total Cars Available Here: ${totalCarsInLocation}
- Cars Currently Booked Here for these dates: ${bookedCarsInLocation}
- Local Market Saturation: ${(bookingRate * 100).toFixed(1)}%

TRIP DETAILS:
- Pickup: ${pickupDate}
- Return: ${returnDate}
- Total Days: ${totalDays}

OWNER CUSTOM RULES:
${rules ? JSON.stringify({
  weekendSurcharge: rules.weekendSurcharge,
  seasonalRules: rules.seasonalRules,
  durationDiscounts: rules.durationDiscounts
}) : 'None'}

EGYPTIAN HOLIDAY CONTEXT (Examples):
- Eid Al-Fitr (April/March)
- Sham El Nessim (April/May)
- Eid Al-Adha (June/May)
- Summer Peak (June - August)
- Winter Off-Peak (Nov - Feb)
    `;

    const prompt = `
You are an expert AI Pricing Strategist for CarRental Pro in Egypt.
Your goal is to evaluate the provided context and determine the optimal pricing multipliers for this specific trip.

${contextStr}

INSTRUCTIONS:
1. Analyze the Market Demand. If market saturation is high (>50%), increase the demandMultiplier.
2. Analyze the Trip Dates. If they overlap with weekends or major Egyptian holidays/summer peak, increase the seasonalMultiplier.
3. Analyze the Car Details. If it's a manual, van, or has very low past bookings, you might offer a slight discount (carFeatureMultiplier < 1.0).
4. Respect the Owner's Custom Rules if any are provided.
5. All multipliers should typically stay between 0.85 and 1.15.

You MUST return ONLY a valid JSON object in this exact format:
{
  "seasonalMultiplier": 1.05,
  "seasonName": "AI: Summer Peak Demand",
  "demandMultiplier": 1.10,
  "demandLabel": "AI: High local market demand (75% saturated)",
  "carFeatureMultiplier": 0.95,
  "carFeatureLabel": "AI: Manual transmission discount"
}
Do not include any Markdown wrappers, explanations, or text outside the JSON object.
    `;

    let aiMultipliers = {
        seasonalMultiplier: 1.0,
        seasonName: "Normal Season",
        demandMultiplier: 1.0,
        demandLabel: "Normal Demand",
        carFeatureMultiplier: 1.0,
        carFeatureLabel: "Standard Features"
    };

    // --- 3. Call AI ---
    try {
        const completion = await openai.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2, // Low temp for more deterministic math/logic
        });

        const aiResponseText = completion.choices[0].message.content;
        const parsed = JSON.parse(aiResponseText);
        
        // Merge AI results safely
        if (parsed.seasonalMultiplier) aiMultipliers.seasonalMultiplier = Number(parsed.seasonalMultiplier);
        if (parsed.seasonName) aiMultipliers.seasonName = parsed.seasonName;
        if (parsed.demandMultiplier) aiMultipliers.demandMultiplier = Number(parsed.demandMultiplier);
        if (parsed.demandLabel) aiMultipliers.demandLabel = parsed.demandLabel;
        if (parsed.carFeatureMultiplier) aiMultipliers.carFeatureMultiplier = Number(parsed.carFeatureMultiplier);
        if (parsed.carFeatureLabel) aiMultipliers.carFeatureLabel = parsed.carFeatureLabel;
        
    } catch (error) {
        console.error("AI Pricing Engine Failed, falling back to 1.0 multipliers:", error);
    }

    // --- 4. Math Calculation (The Calculator) ---
    // Apply multipliers to base price
    let calculatedDailyPrice = basePrice * 
                               aiMultipliers.seasonalMultiplier * 
                               aiMultipliers.demandMultiplier * 
                               aiMultipliers.carFeatureMultiplier;

    let totalPrice = calculatedDailyPrice * totalDays;

    // Apply strict +/- 15% safety cap
    const minAllowedPrice = basePrice * 0.85 * totalDays;
    const maxAllowedPrice = basePrice * 1.15 * totalDays;
    
    let cappedStatus = false;

    if (totalPrice > maxAllowedPrice) {
        totalPrice = maxAllowedPrice;
        cappedStatus = "max";
    } else if (totalPrice < minAllowedPrice) {
        totalPrice = minAllowedPrice;
        cappedStatus = "min";
    }

    const taxAmount = Math.round(totalPrice * 0.10);
    totalPrice += taxAmount;

    return {
        totalPrice: Math.round(totalPrice),
        averagePricePerDay: Math.round(totalPrice / totalDays),
        breakdown: {
            basePrice,
            totalDays,
            ...aiMultipliers,
            capped: cappedStatus,
            taxAmount: Math.round(taxAmount)
        }
    };
};
