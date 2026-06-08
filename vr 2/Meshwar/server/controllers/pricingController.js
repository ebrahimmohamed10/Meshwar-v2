import { calculateDynamicPrice } from "../utils/pricingEngine.js";
import Car from "../models/Car.js";

// API to Calculate Dynamic Price Preview
export const calculatePrice = async (req, res) => {
    try {
        const { carId, pickupDate, returnDate } = req.body;
        
        if (!pickupDate || !returnDate) {
            return res.json({ success: false, message: "Missing dates" });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }

        if (car.dynamicPricingEnabled) {
            const pricing = await calculateDynamicPrice({ carId, pickupDate, returnDate });
            return res.json({ success: true, pricing });
        } else {
            const picked = new Date(pickupDate);
            const returned = new Date(returnDate);
            const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1;
            let price = car.pricePerDay * noOfDays;
            
            const taxAmount = Math.round(price * 0.10);
            price += taxAmount;
            
            return res.json({ 
                success: true, 
                pricing: { 
                    totalPrice: price, 
                    averagePricePerDay: car.pricePerDay, 
                    breakdown: {
                        basePrice: car.pricePerDay,
                        totalDays: noOfDays,
                        taxAmount
                    }
                } 
            });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
