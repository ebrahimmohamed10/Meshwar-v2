import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    pickupDate: {type: Date, required: true},
    returnDate: {type: Date, required: true},
    status: {type: String, enum: ["pending", "confirmed", "cancelled", "rejected"], default: "pending"},
    cancellationReason: {type: String},
    price: {type: Number, required: true},
    priceBreakdown: {
        basePrice: Number,
        durationDiscount: Number,
        weekendDays: Number,
        leadTimeMultiplier: Number,
        averagePricePerDay: Number
    },
    paymentMethod: {type: String, default: "offline"}
},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking