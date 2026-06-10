import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
    // Singleton document key
    key: { type: String, default: "global", unique: true },

    // Commission rate (0.0 to 1.0) — e.g. 0.10 = 10%
    commissionRate: { type: Number, default: 0.10, min: 0, max: 1 },

    // Minimum wallet balance required before owner can withdraw
    minWithdrawalAmount: { type: Number, default: 1000 },

    // Currency label
    currency: { type: String, default: "EGP" },
}, { timestamps: true });

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export default SystemSettings;
