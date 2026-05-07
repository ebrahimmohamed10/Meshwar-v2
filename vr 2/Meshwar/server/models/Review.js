import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    category: { type: String, enum: ['experience', 'website', 'service', 'other'], default: 'experience' },
    isApproved: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
