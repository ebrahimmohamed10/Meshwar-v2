import PricingRule from "../models/PricingRule.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

/**
 * Calculate the dynamic price for a car rental
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

    const breakdown = {
        basePrice,
        totalDays,
        seasonalMultiplier: 1.0,
        seasonName: null,
        demandMultiplier: 1.0,
        demandLabel: "Normal Demand",
        carFeatureMultiplier: 1.0,
        carFeatureLabel: "",
        durationDiscount: 1.0,
        durationLabel: "Standard",
        weekendDays: 0,
        weekdayDays: 0,

        dailyBreakdown: []
    };

    // --- 1 & 2. تحليل البيانات (Market Data & Demand) ---
    // See how many cars are booked in this location during these dates
    const totalCarsInLocation = await Car.countDocuments({ location: car.location, isAvaliable: true });
    const bookedCarsInLocation = await Booking.countDocuments({
        status: { $in: ['confirmed', 'pending'] },
        pickupDate: { $lte: returnD },
        returnDate: { $gte: pickup }
    });

    // Booking rate in this area
    const bookingRate = totalCarsInLocation > 0 ? (bookedCarsInLocation / totalCarsInLocation) : 0;

    // Check total reservations for this specific car
    const totalHistoricalBookings = await Booking.countDocuments({ car: carId, status: 'confirmed' });



    // Car Features Demand (Manual, Diesel, Van, Low Reservations)
    let carFeatureDiscount = 0;
    let featureReasons = [];

    if (car.transmission && car.transmission.toLowerCase() === 'manual') {
        carFeatureDiscount += 0.05; // 5% discount
        featureReasons.push("Manual");
    }
    if (car.fuel_type && car.fuel_type.toLowerCase() === 'diesel') {
        carFeatureDiscount += 0.05; // 5% discount
        featureReasons.push("Diesel");
    }
    if (car.category && car.category.toLowerCase() === 'van') {
        carFeatureDiscount += 0.05; // 5% discount
        featureReasons.push("Van");
    }
    if (totalHistoricalBookings < 3) {
        carFeatureDiscount += 0.05; // 5% discount for new/low popularity
        featureReasons.push("Low Reservations");
    }

    if (carFeatureDiscount > 0) {
        // Cap max feature discount to 15%
        carFeatureDiscount = Math.min(carFeatureDiscount, 0.15);

        breakdown.carFeatureMultiplier = 1 - carFeatureDiscount;
        breakdown.carFeatureLabel = `Low Popularity Traits (${featureReasons.join(', ')})`;
    }

    let totalPrice = 0;

    for (let i = 0; i < totalDays; i++) {
        const currentDay = new Date(pickup);
        currentDay.setDate(currentDay.getDate() + i);

        let dayPrice = basePrice;
        let dayMultiplier = 1.0;

        const monthDay = `${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
        let seasonMultiplier = 1.0;
        let seasonName = null;

        // --- 3. ضبط الأسعار في الأجازات والمناسبات (Dynamic Holidays Multi-Year) ---
        const currentYear = currentDay.getFullYear();

        // Fixed Annual Holidays (Gregorian) - Same every year
        const fixedHolidays = [
            { name: "New Year & Coptic Christmas", start: "12-25", end: "01-08", multiplier: 1.15 },
            { name: "Revolution/Police Day", start: "01-24", end: "01-26", multiplier: 1.15 },
            { name: "June 30 Revolution", start: "06-29", end: "07-01", multiplier: 1.15 },
            { name: "July 23 Revolution", start: "07-22", end: "07-24", multiplier: 1.15 },
            { name: "حرب 6 اكتوبر", start: "10-05", end: "10-07", multiplier: 1.15 },
            { name: "Summer Peak Season", start: "06-01", end: "08-31", multiplier: 1.15 },
            { name: "Winter Off-Peak", start: "11-01", end: "02-28", multiplier: 0.85 }
        ];

        // Dynamic Holidays (Islamic & Sham El Nessim) - Shifts every year
        const dynamicHolidays = {
            2024: [
                { name: "Eid Al-Fitr", start: "04-09", end: "04-14", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "05-05", end: "05-07", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "06-15", end: "06-20", multiplier: 1.15 },
                { name: "Islamic New Year", start: "07-07", end: "07-09", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "09-15", end: "09-17", multiplier: 1.15 }
            ],
            2025: [
                { name: "Eid Al-Fitr", start: "03-30", end: "04-04", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "04-20", end: "04-22", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "06-05", end: "06-10", multiplier: 1.15 },
                { name: "Islamic New Year", start: "06-26", end: "06-28", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "09-04", end: "09-06", multiplier: 1.15 }
            ],
            2026: [
                { name: "Eid Al-Fitr", start: "03-19", end: "03-24", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "04-12", end: "04-14", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "05-26", end: "05-31", multiplier: 1.15 },
                { name: "Islamic New Year", start: "06-15", end: "06-17", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "08-24", end: "08-26", multiplier: 1.15 }
            ],
            2027: [
                { name: "Eid Al-Fitr", start: "03-09", end: "03-14", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "05-02", end: "05-04", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "05-15", end: "05-20", multiplier: 1.15 },
                { name: "Islamic New Year", start: "06-05", end: "06-07", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "08-14", end: "08-16", multiplier: 1.15 }
            ],
            2028: [
                { name: "Eid Al-Fitr", start: "02-26", end: "03-03", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "04-16", end: "04-18", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "05-04", end: "05-09", multiplier: 1.15 },
                { name: "Islamic New Year", start: "05-24", end: "05-26", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "08-02", end: "08-04", multiplier: 1.15 }
            ],
            2029: [
                { name: "Eid Al-Fitr", start: "02-14", end: "02-19", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "04-08", end: "04-10", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "04-23", end: "04-28", multiplier: 1.15 },
                { name: "Islamic New Year", start: "05-13", end: "05-15", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "07-23", end: "07-25", multiplier: 1.15 }
            ],
            2030: [
                { name: "Eid Al-Fitr", start: "02-04", end: "02-09", multiplier: 1.15 },
                { name: "Sham El Nessim", start: "04-28", end: "04-30", multiplier: 1.15 },
                { name: "Eid Al-Adha", start: "04-12", end: "04-17", multiplier: 1.15 },
                { name: "Islamic New Year", start: "05-03", end: "05-05", multiplier: 1.15 },
                { name: "Prophet's Birthday", start: "07-12", end: "07-14", multiplier: 1.15 }
            ]
        };

        const currentYearHolidays = dynamicHolidays[currentYear] || [];
        const allHolidays = [...fixedHolidays, ...currentYearHolidays];

        let hasSurcharge = false;
        for (const holiday of allHolidays) {
            let isMatch = false;
            // Handle cross-year dates like 12-25 to 01-08 or 11-01 to 02-28
            if (holiday.start > holiday.end) {
                isMatch = (monthDay >= holiday.start || monthDay <= holiday.end);
            } else {
                isMatch = (monthDay >= holiday.start && monthDay <= holiday.end);
            }

            if (isMatch) {
                if (holiday.multiplier > 1.0) {
                    // It's a surcharge. Take the highest surcharge if there are overlaps.
                    if (holiday.multiplier > seasonMultiplier || !hasSurcharge) {
                        seasonMultiplier = holiday.multiplier;
                        seasonName = holiday.name;
                        hasSurcharge = true;
                    }
                } else if (holiday.multiplier < 1.0 && !hasSurcharge) {
                    // It's a discount. Only apply if no surcharge has been found for this date.
                    if (seasonMultiplier === 1.0 || holiday.multiplier < seasonMultiplier) {
                        seasonMultiplier = holiday.multiplier;
                        seasonName = holiday.name;
                    }
                }
            }
        }

        // Custom rules from Database override default seasons
        if (rules?.seasonalRules?.length) {
            for (const season of rules.seasonalRules) {
                if (monthDay >= season.startDate && monthDay <= season.endDate) {
                    seasonMultiplier = season.multiplier;
                    seasonName = season.name;
                    break;
                }
            }
        }

        if (seasonMultiplier !== 1.0) {
            dayMultiplier *= seasonMultiplier;
            breakdown.seasonalMultiplier = seasonMultiplier;
            breakdown.seasonName = seasonName;
        }

        // Weekend vs Weekday (أيام عادية وسط الأسبوع الطلب قليل تنزل السعر)
        const dayOfWeek = currentDay.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            // Weekend (Friday, Saturday)
            dayMultiplier *= (rules?.weekendSurcharge || 1.15);
            breakdown.weekendDays++;
        } else {
            // Weekday (Sunday to Thursday) - Low demand during week
            // Example 1000 -> 800 if no other high demand factor is applied
            if (seasonMultiplier === 1.0 && breakdown.demandMultiplier <= 1.0) {
                dayMultiplier *= 0.8; // Apply 20% discount on normal weekdays
            }
            breakdown.weekdayDays++;
        }

        dayPrice = basePrice * dayMultiplier * breakdown.demandMultiplier * breakdown.carFeatureMultiplier;

        breakdown.dailyBreakdown.push({
            date: currentDay.toISOString().split('T')[0],
            price: Math.round(dayPrice),
            isWeekend: dayOfWeek === 5 || dayOfWeek === 6
        });

        totalPrice += dayPrice;
    }

    // Duration discount
    if (rules?.durationDiscounts?.length) {
        for (const tier of rules.durationDiscounts.sort((a, b) => b.minDays - a.minDays)) {
            if (totalDays >= tier.minDays && (!tier.maxDays || totalDays <= tier.maxDays)) {
                breakdown.durationDiscount = 1 - tier.discount;
                breakdown.durationLabel = `${tier.discount * 100}% off (${totalDays} days)`;
                totalPrice *= (1 - tier.discount);
                break;
            }
        }
    }


    // --- Price Caps (-15% min, +15% max) ---
    const minAllowedPrice = basePrice * 0.85 * totalDays;
    const maxAllowedPrice = basePrice * 1.15 * totalDays;
    
    breakdown.capped = false;

    if (totalPrice > maxAllowedPrice) {
        totalPrice = maxAllowedPrice;
        breakdown.capped = "max";
    } else if (totalPrice < minAllowedPrice) {
        totalPrice = minAllowedPrice;
        breakdown.capped = "min";
    }

    const taxAmount = Math.round(totalPrice * 0.10);
    totalPrice += taxAmount;
    breakdown.taxAmount = taxAmount;

    return {
        totalPrice: Math.round(totalPrice),
        averagePricePerDay: Math.round(totalPrice / totalDays),
        breakdown
    };
};
