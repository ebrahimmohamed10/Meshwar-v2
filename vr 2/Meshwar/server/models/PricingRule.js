import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const pricingRuleSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: 'Car', default: null },
    owner: { type: ObjectId, ref: 'User', required: true },
    
    // Seasonal rules
    seasonalRules: [{
        name: { type: String },           // e.g. "Summer", "Winter"
        startDate: { type: String },       // MM-DD format e.g. "06-01"
        endDate: { type: String },         // MM-DD format e.g. "08-31"
        multiplier: { type: Number, default: 1.0 }
    }],
    
    // Duration-based discounts
    durationDiscounts: [{
        minDays: { type: Number },
        maxDays: { type: Number },
        discount: { type: Number } // e.g. 0.05 = 5% off
    }],
    
    // Weekend surcharge
    weekendSurcharge: { type: Number, default: 1.15 },
    
    // Last-minute / early-bird
    earlyBirdDiscount: { type: Number, default: 0.95 },    // >15 days
    
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);
export default PricingRule;
