import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import OpenAI from "openai";


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
        const licenseFrontFile = files.licenseFront ? files.licenseFront[0] : null
        const licenseBackFile = files.licenseBack ? files.licenseBack[0] : null

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
        if (licenseFrontFile) {
            updateData.licenseFront = await uploadToImageKit(licenseFrontFile, '/user_docs')
        }
        if (licenseBackFile) {
            updateData.licenseBack = await uploadToImageKit(licenseBackFile, '/user_docs')
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

// AI Profile Verification using Groq Llama 4 Scout Vision
export const verifyUserProfile = async (req, res) => {
    try {
        const { _id } = req.user
        const user = await User.findById(_id)

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        // Check if all four documents are uploaded
        if (!user.idCardFront || !user.idCardBack || !user.licenseFront || !user.licenseBack) {
            return res.json({ 
                success: false, 
                message: "Please upload your ID Front, ID Back, License Front, and License Back documents before starting verification." 
            })
        }

        // Check if other profile fields are filled
        if (!user.name || user.name.trim() === '' || 
            !user.dob || user.dob === 'Not Selected' || 
            !user.idNumber || user.idNumber === 'Not Selected' || 
            !user.licenseNumber || user.licenseNumber === 'Not Selected') {
            return res.json({
                success: false,
                message: "Please fill in your Full Name, Date of Birth, National ID / Passport number, and Driving License number in your profile details first."
            })
        }

        // Update status to pending
        await User.findByIdAndUpdate(_id, { 
            verificationStatus: 'pending',
            verificationError: '',
            verificationReport: ''
        })

        // Call Groq Vision
        const openai = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1'
        });

        const currentDateStr = new Date().toLocaleDateString();

        const response = await openai.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            response_format: { type: "json_object" },
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are a professional KYC (Know Your Customer) document verification system.
Your job is to analyze the attached user identification documents and verify that the information is correct and belongs to the same person.

USER PROFILE DETAILS TO CHECK:
- Full Name: ${user.name}
- Date of Birth: ${user.dob}
- National ID / Passport Number: ${user.idNumber}
- Driving License Number: ${user.licenseNumber}
- Nationality: ${user.nationality || 'Not Selected'}
- Gender: ${user.gender || 'Not Selected'}

DOCUMENTS ATTACHED:
1. ID Front Side: ${user.idCardFront}
2. ID Back Side: ${user.idCardBack}
3. License Front Side: ${user.licenseFront}
4. License Back Side: ${user.licenseBack}

Verify the following rules:
1. Valid documents: Are these documents readable and actual ID/License images?
2. Matching details: Does the name, DOB, ID number, and License number on the documents match the profile details? Allow minor spelling variations or transliteration differences, but reject major mismatches.
3. Same person: Do all documents belong to the exact same person?
4. Expiration: Are the documents currently expired? (Current Date is ${currentDateStr}).

Return your response ONLY as a JSON object with:
{
  "status": "verified" or "rejected",
  "report": "A detailed analysis report in Markdown format, with sections for: Documents Readability, Detail Comparison, Expiration Checks, and Verification Summary. Be professional.",
  "error": "A brief explanation of why the verification failed (if status is 'rejected'), or empty string (if status is 'verified')."
}`
                        },
                        { type: 'image_url', image_url: { url: user.idCardFront } },
                        { type: 'image_url', image_url: { url: user.idCardBack } },
                        { type: 'image_url', image_url: { url: user.licenseFront } },
                        { type: 'image_url', image_url: { url: user.licenseBack } }
                    ]
                }
            ]
        });

        const resultJsonStr = response.choices[0].message.content;
        console.log("AI Verification Output:", resultJsonStr);

        let result;
        try {
            result = JSON.parse(resultJsonStr);
        } catch (e) {
            result = {
                status: 'rejected',
                report: resultJsonStr,
                error: 'Failed to parse structured AI response.'
            };
        }

        const finalStatus = ['verified', 'rejected'].includes(result.status) ? result.status : 'rejected';
        const finalReport = result.report || resultJsonStr;
        const finalError = result.error || (finalStatus === 'rejected' ? 'AI verification checks failed.' : '');

        // Update database
        const updatedUser = await User.findByIdAndUpdate(_id, {
            verificationStatus: finalStatus,
            verificationReport: finalReport,
            verificationError: finalError
        }, { new: true });

        res.json({ 
            success: true, 
            message: finalStatus === 'verified' ? "Verification Succeeded!" : "Verification Failed.",
            user: updatedUser
        });

    } catch (error) {
        console.error("Verification error:", error.message);
        try {
            await User.findByIdAndUpdate(req.user._id, { 
                verificationStatus: 'rejected', 
                verificationError: `Internal verification error: ${error.message}`
            });
        } catch (e) {}

        res.json({ success: false, message: error.message })
    }
}