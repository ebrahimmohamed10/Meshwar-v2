import OpenAI from 'openai';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Initialize Groq client using OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// ─── Build a rich inventory snapshot from real DB data ───────────────────────
const buildInventoryContext = (cars) => {
  if (!cars.length) return 'No cars are currently listed in the inventory.';

  const available = cars.filter(c => c.isAvaliable);
  const unavailable = cars.filter(c => !c.isAvaliable);

  // Stats
  const prices = cars.map(c => c.pricePerDay);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = (prices.reduce((s, p) => s + p, 0) / prices.length).toFixed(2);

  // Group helpers
  const groupBy = (arr, key) =>
    arr.reduce((acc, c) => { acc[c[key]] = (acc[c[key]] || 0) + 1; return acc; }, {});

  const byCategory = groupBy(cars, 'category');
  const byFuel = groupBy(cars, 'fuel_type');
  const byTransmission = groupBy(cars, 'transmission');

  // Category price ranges
  const categoryPrices = {};
  cars.forEach(c => {
    if (!categoryPrices[c.category]) categoryPrices[c.category] = [];
    categoryPrices[c.category].push(c.pricePerDay);
  });
  const categoryRanges = Object.entries(categoryPrices)
    .map(([cat, ps]) => `${cat}: ${Math.min(...ps)}EGP–${Math.max(...ps)}EGP/day`)
    .join(', ');

  // Full car list (concise per car)
  const carList = cars.map(c =>
    `  [DatabaseID: ${c._id}] [ImgURL: ${c.image}] ${c.brand} ${c.model} (${c.year}) | ${c.category} | ${c.fuel_type} | ${c.transmission} | ${c.seating_capacity} seats | ${c.pricePerDay}EGP/day | Location: ${c.location} | ${c.isAvaliable ? '✅ Available' : '❌ Not available'}`
  ).join('\n');

  return `
=== LIVE INVENTORY DATA (pulled from database right now) ===

SUMMARY:
- Total cars listed: ${cars.length}  (${available.length} available, ${unavailable.length} not available)
- Price range: ${minPrice}EGP – ${maxPrice}EGP per day
- Average price: ${avgPrice}EGP/day
- Categories and price ranges: ${categoryRanges}
- Fuel types: ${Object.entries(byFuel).map(([k, v]) => `${k} (${v})`).join(', ')}
- Transmissions: ${Object.entries(byTransmission).map(([k, v]) => `${k} (${v})`).join(', ')}
- Category breakdown: ${Object.entries(byCategory).map(([k, v]) => `${k} (${v})`).join(', ')}

FULL CAR LISTING:
${carList}
=== END INVENTORY ===
`;
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a knowledgeable and friendly car rental assistant for CarRental Pro.

IMPORTANT RULES:
1. Always answer using ONLY the real inventory data provided below — never invent prices or specs.
2. When asked about pricing, list actual cars with their exact prices from the data.
3. When asked about availability, only mention cars marked ✅ Available.
4. When asked about a specific brand/model/category, filter from the inventory and give exact details.
5. **RICH UI CAR CARDS (CRITICAL RULE):** You must NEVER output plain text lists of cars with raw IDs or image URLs. When listing, recommending, or showing cars, you MUST output this exact tag for EACH car so our UI can render it:
   [CAR_CARD: id="DatabaseID" brand="BrandName" model="ModelName" image="ImgURL" price="Price"]
   Example: "Here are the available cars: \n [CAR_CARD: id="123" brand="BMW" model="X5" image="http..." price="1000"]"
   Make sure you put the entire tag on ONE single line without line breaks inside the brackets.
6. **MAXIMUM 3 CARS:** To avoid overwhelming the user, NEVER list more than 3 cars in a single message. If they ask for "all cars", show 3 and tell them they can view the rest on the Cars page.
6. Be concise, warm, and professional.
7. If something is not in the inventory data, say so honestly.
8. **USER AWARENESS:** If user context is provided below, use their name to be friendly. You can also tell them their wallet balance if they ask.

{USER_CONTEXT}

{INVENTORY}
`;

// ─── Main chat handler ────────────────────────────────────────────────────────
export const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [], userContext = null } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch ALL cars fresh from DB every request (ensures live data)
    const cars = await Car.find({}).lean();

    // Format User Context
    let userContextString = "The user is currently browsing as a Guest (not logged in).";
    if (userContext) {
      userContextString = `USER CONTEXT:\n- Name: ${userContext.name}\n- Email: ${userContext.email}\n- Wallet Balance: ${userContext.walletBalance}EGP\n- Role: ${userContext.role}\n(Speak to them by their first name!)`;
    }

    // Build rich real-data context
    const inventoryContext = buildInventoryContext(cars);
    let systemPrompt = SYSTEM_PROMPT.replace('{INVENTORY}', inventoryContext);
    systemPrompt = systemPrompt.replace('{USER_CONTEXT}', userContextString);

    // Smart search: if user asks about something specific, find matching cars
    let extraContext = '';
    const lowerMsg = message.toLowerCase();

    // Detect intent keywords
    const isCarQuery = ['car', 'vehicle', 'rent', 'available', 'book', 'price', 'cost',
      'cheap', 'suv', 'sedan', 'luxury', 'economy', 'fuel', 'automatic', 'manual',
      'seat', 'brand', 'toyota', 'honda', 'bmw', 'mercedes', 'ford', 'hyundai',
      'electric', 'hybrid', 'diesel', 'petrol', 'location'].some(kw => lowerMsg.includes(kw));

    if (isCarQuery) {
      // Extract meaningful search terms
      const stopWords = new Set(['what', 'when', 'where', 'which', 'how', 'can',
        'does', 'have', 'this', 'that', 'with', 'from', 'your', 'show', 'tell',
        'about', 'much', 'many', 'list', 'give', 'are', 'the', 'and', 'for']);

      const searchTerms = lowerMsg
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

      if (searchTerms.length > 0) {
        const pattern = searchTerms.join('|');
        const matched = cars.filter(c =>
          new RegExp(pattern, 'i').test(
            `${c.brand} ${c.model} ${c.category} ${c.fuel_type} ${c.transmission} ${c.location} ${c.description}`
          )
        );

        if (matched.length > 0 && matched.length < cars.length) {
          extraContext = `\n\n[SEARCH MATCH for "${searchTerms.join(' ')}"]\n` +
            matched.map(c =>
              `[DatabaseID: ${c._id}] [ImgURL: ${c.image}] ${c.brand} ${c.model} (${c.year}) — ${c.category}, ${c.fuel_type}, ${c.transmission}, ${c.seating_capacity} seats, ${c.pricePerDay}EGP/day, ${c.location}, ${c.isAvaliable ? 'Available' : 'Not available'}\n  Description: ${c.description}`
            ).join('\n\n');
        }
      }
    }

    // Build message array for Groq
    const messages = [
      { role: 'system', content: systemPrompt + extraContext },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    // Call Groq API (OpenAI-compatible)
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 2000,
      temperature: 0.5,   // lower = more factual/accurate
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
};

// ─── Quick actions ────────────────────────────────────────────────────────────
export const getQuickActions = async (req, res) => {
  try {
    const quickActions = [
      { id: 'browse', label: 'Browse Cars', icon: '🚗', query: 'Show me all available cars with their prices' },
      { id: 'cheap', label: 'Cheapest Cars', icon: '💸', query: 'What are the cheapest cars available to rent?' },
      { id: 'categories', label: 'Categories', icon: '📋', query: 'What car categories do you offer and what are the prices?' },
      { id: 'support', label: 'How to Book', icon: '🎧', query: 'How do I book a car?' }
    ];
    res.json({ success: true, quickActions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load quick actions' });
  }
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const getFAQ = async (req, res) => {
  try {
    const faqs = [
      {
        question: 'How do I book a car?',
        answer: 'Browse our available cars, select your preferred vehicle, choose your rental dates, and complete the booking process with your details.'
      },
      {
        question: 'What documents do I need?',
        answer: "You'll need a valid driver's license, proof of identity, and a credit card for the security deposit."
      },
      {
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel your booking. Cancellation policies vary depending on the rental terms. Please check your booking details or contact support.'
      },
      {
        question: 'Is insurance included?',
        answer: 'Basic insurance is included with all rentals. Additional coverage options are available at an extra cost.'
      },
      {
        question: 'What is the mileage limit?',
        answer: 'Most rentals include unlimited mileage. Some specialty vehicles may have daily mileage limits. Check the car details for specific information.'
      }
    ];
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load FAQs' });
  }
};

// ─── AI Smart Search for Recommended Cars Bar ─────────────────────────────────
export const getSmartRecommendations = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Fetch all available cars
    const cars = await Car.find({ status: 'approved', isAvaliable: true }).lean();
    if (!cars.length) {
      return res.json({ success: true, recommendedCars: [] });
    }

    let userContextStr = "The user is browsing as a Guest. No past booking or viewing history available.";
    
    // Fetch personalized data if userId is provided
    if (userId) {
      const user = await User.findById(userId).populate('viewedCars').lean();
      
      if (user) {
        // Compute viewed car preferences
        const viewedCategories = {};
        if (user.viewedCars && user.viewedCars.length > 0) {
          user.viewedCars.forEach(car => {
            if (car && car.category) {
              viewedCategories[car.category] = (viewedCategories[car.category] || 0) + 1;
            }
          });
        }
        
        const topCategories = Object.entries(viewedCategories)
          .sort((a, b) => b[1] - a[1])
          .map(e => e[0])
          .slice(0, 2); // Get top 2 categories

        // Fetch past bookings to compute typical budget
        const pastBookings = await Booking.find({ user: userId }).populate('car').lean();
        let avgBudgetStr = "Unknown";
        let lastBookedCarStr = "None";
        
        if (pastBookings.length > 0) {
          const totalSpent = pastBookings.reduce((sum, b) => sum + (b.priceBreakdown?.averagePricePerDay || (b.price / (b.duration || 1))), 0);
          const avgDaily = Math.round(totalSpent / pastBookings.length);
          avgBudgetStr = `${avgDaily} EGP/day`;
          
          // Assuming bookings are ordered chronologically by default, or we take the last one in the array
          const lastBooking = pastBookings[pastBookings.length - 1];
          if (lastBooking && lastBooking.car) {
            lastBookedCarStr = `${lastBooking.car.brand} ${lastBooking.car.model} (${lastBooking.car.category})`;
          }
        }

        userContextStr = `
USER PREFERENCES AND HISTORY:
- Top Viewed Categories: ${topCategories.length > 0 ? topCategories.join(', ') : 'None yet'}
- Typical Budget (Based on past bookings): ${avgBudgetStr}
- Last Booked Car: ${lastBookedCarStr}
`;
      }
    }

    // Prepare lightweight inventory data for the AI to pick from
    const inventoryData = cars.map(c => 
      `[ID: ${c._id}] ${c.brand} ${c.model} (${c.year}) | Category: ${c.category} | Fuel: ${c.fuel_type} | Trans: ${c.transmission} | Seats: ${c.seating_capacity} | Price: ${c.pricePerDay} EGP/day`
    ).join('\\n');

    const prompt = `
You are an AI Recommendation Engine for CarRental Pro.
Your task is to match the user's natural language request to exactly 8 suitable cars from our inventory.

${userContextStr}

USER'S REQUEST: "${message || 'No specific request. Just recommend the best cars for me based on my preferences and budget.'}"

INVENTORY:
${inventoryData}

INSTRUCTIONS:
1. Analyze the USER'S REQUEST. 
2. If USER PREFERENCES AND HISTORY is available, use it as a primary ranking factor (e.g., if they usually book SUVs, prioritize SUVs near their Typical Budget).
3. Select up to 8 of the best matching cars from the INVENTORY.
4. Return the result ONLY as a JSON object in this exact format:
{
  "recommendedIds": ["id1", "id2", ... up to 8],
  "aiTitle": "A catchy, personalized title summarizing the recommendation (e.g., '✨ AI Picks: Perfect SUVs for your Family Trip', or '✨ Curated For You' if no specific request)"
}
Do not include any other text or markdown wrappers. Only valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more factual matching
    });

    const aiResponseText = completion.choices[0].message.content;
    let aiResponse;
    try {
      aiResponse = JSON.parse(aiResponseText);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", aiResponseText);
      return res.status(500).json({ success: false, error: 'AI returned invalid format' });
    }

    // Fetch the full car objects based on the AI's selected IDs
    let recommendedCars = [];
    if (aiResponse.recommendedIds && Array.isArray(aiResponse.recommendedIds) && aiResponse.recommendedIds.length > 0) {
      // Map IDs back to full car objects, preserving the AI's order if possible
      recommendedCars = aiResponse.recommendedIds.map(id => cars.find(c => c._id.toString() === id)).filter(Boolean);
    }

    // Fallback: If AI didn't find any or broke, return top popularity
    if (recommendedCars.length === 0) {
      recommendedCars = cars.sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0)).slice(0, 8);
      aiResponse.aiTitle = "✨ Recommended Cars";
    }

    res.json({
      success: true,
      aiTitle: aiResponse.aiTitle || "✨ Recommended Cars",
      recommendedCars
    });

  } catch (error) {
    console.error('Smart Recommendation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate recommendations' });
  }
};