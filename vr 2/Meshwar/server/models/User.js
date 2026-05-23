import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["owner", "user"], default: 'user' },
    image: { type: String, default: '' },
    phone: { type: String, default: '0000000000' },
    address: { type: String, default: 'Not Selected' },
    dob: { type: String, default: 'Not Selected' },
    gender: { type: String, default: 'Not Selected' },
    nationality: { type: String, default: 'Not Selected' },
    idNumber: { type: String, default: 'Not Selected' },
    emergencyContact: { type: String, default: 'Not Selected' },
    job: { type: String, default: 'Not Selected' },
    licenseNumber: { type: String, default: 'Not Selected' },
    licenseExpiry: { type: String, default: 'Not Selected' },
    city: { type: String, default: 'Not Selected' },
    zipCode: { type: String, default: 'Not Selected' },
    country: { type: String, default: 'Not Selected' },
    idCardFront: { type: String, default: '' },
    idCardBack: { type: String, default: '' },
    licenseFront: { type: String, default: '' },
    licenseBack: { type: String, default: '' },
    verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
    verificationReport: { type: String, default: '' },
    verificationError: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    wallet: { type: Number, default: 0 },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

export default User