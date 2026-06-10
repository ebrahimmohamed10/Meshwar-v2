import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // e.g. "Vodafone Cash", "InstaPay", "Bank Transfer"
    details: { type: String, required: true }, // phone number, IPA address, or bank account info
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Completed" },
    walletType: { type: String, enum: ["renter", "owner"], default: "renter" }
}, { timestamps: true });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
