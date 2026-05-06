import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";


// Generate JWT Token
const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: 'Fill all the fields' })
        }

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword })
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Login User 
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') })
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }       
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get User data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
        const { user } = req;
        res.json({ success: true, user })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get All Cars for the Frontend
export const getCars = async (req, res) => {
    try {
        const cars = await Car.aggregate([
            { $match: { status: 'approved' } },
            {
                $lookup: {
                    from: "bookings",
                    localField: "_id",
                    foreignField: "car",
                    as: "bookings"
                }
            },
            {
                $addFields: {
                    bookingCount: { $size: "$bookings" }
                }
            },
            { $project: { bookings: 0 } },
            { $sort: { isAvaliable: -1, bookingCount: -1 } }
        ]);
        res.json({ success: true, cars })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Update User Profile
export const updateUserProfile = async (req, res) => {
    try {
        const { _id } = req.user
        const { name, phone, address, dob, gender, nationality, idNumber, emergencyContact, job, licenseNumber, licenseExpiry, city, zipCode, country } = req.body

        // Handle Multiple Files
        const files = req.files || {}
        const imageFile = files.image ? files.image[0] : null
        const idCardFrontFile = files.idCardFront ? files.idCardFront[0] : null
        const idCardBackFile = files.idCardBack ? files.idCardBack[0] : null

        if (!name || !phone) {
            return res.json({ success: false, message: "Name and Phone are required" })
        }

        let updateData = { name, phone, address, dob, gender, nationality, idNumber, emergencyContact, job, licenseNumber, licenseExpiry, city, zipCode, country };

        // Helper function for ImageKit upload
        const uploadToImageKit = async (file, folder) => {
            const fileBuffer = fs.readFileSync(file.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: file.originalname,
                folder: folder
            })
            return imagekit.url({
                path: response.filePath,
                transformation: [{ width: '800' }, { quality: 'auto' }, { format: 'webp' }]
            });
        }

        if (imageFile) {
            updateData.image = await uploadToImageKit(imageFile, '/users')
        }
        if (idCardFrontFile) {
            updateData.idCardFront = await uploadToImageKit(idCardFrontFile, '/user_docs')
        }
        if (idCardBackFile) {
            updateData.idCardBack = await uploadToImageKit(idCardBackFile, '/user_docs')
        }

        await User.findByIdAndUpdate(_id, updateData)

        res.json({ success: true, message: "Profile Updated" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Upgrade User to Premium
export const upgradeToPremium = async (req, res) => {
    try {
        const { _id } = req.user;
        const { paymentMethod, billingCycle, plan } = req.body;

        const plans = {
            standard: { monthly: 99, annual: 990 },
            professional: { monthly: 199, annual: 1990 }
        };

        if (paymentMethod === 'Wallet') {
            const user = await User.findById(_id);
            const price = plans[plan || 'standard'][billingCycle || 'monthly'];

            if (user.wallet < price) {
                return res.json({ success: false, message: "Insufficient wallet balance" });
            }
            await User.findByIdAndUpdate(_id, { $inc: { wallet: -price } });
        }

        await User.findByIdAndUpdate(_id, { isPremium: true, role: 'owner' });
        res.json({ success: true, message: "Welcome to Premium! Your dashboard is now ready." });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}