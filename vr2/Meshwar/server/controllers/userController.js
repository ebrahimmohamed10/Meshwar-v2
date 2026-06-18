import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import OpenAI from "openai";
import Withdrawal from "../models/Withdrawal.js";
import { sendVerificationEmail } from "../utils/email.js";


// Generate JWT Token
const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body

        if (!name || !email || !password || !phone || password.length < 8) {
            return res.json({ success: false, message: 'Fill all the fields' })
        }

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            phone, 
            role: role || 'user' 
        })
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
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            {
                $unwind: {
                    path: "$ownerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: { 
                    bookings: 0,
                    "ownerDetails.password": 0,
                    "ownerDetails.role": 0,
                    "ownerDetails.resetCode": 0,
                    "ownerDetails.resetCodeExpiry": 0
                } 
            },
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

        // Reset verification if any verification-sensitive fields changed
        const existingUser = await User.findById(_id)
        const verificationSensitiveChanged =
            idCardFrontFile || idCardBackFile || licenseFrontFile || licenseBackFile ||
            (idNumber !== (existingUser.idNumber || '')) ||
            (licenseNumber !== (existingUser.licenseNumber || '')) ||
            (dob !== (existingUser.dob || ''))

        if (verificationSensitiveChanged && existingUser.verificationStatus !== 'unverified') {
            updateData.verificationStatus = 'unverified'
            updateData.verificationReport = ''
            updateData.verificationError = ''
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

        // Calculate expiry date
        const expiryDate = new Date();
        if (billingCycle === 'annual') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        await User.findByIdAndUpdate(_id, { 
            isPremium: true, 
            role: 'owner',
            subscriptionPlan: billingCycle || 'monthly',
            subscriptionExpiryDate: expiryDate
        });
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

        // 1. Account Lockout Check
        if (user.verificationLocked) {
            return res.json({
                success: false,
                message: "Your account verification is locked due to too many failed attempts (Max 5). Please contact support."
            })
        }

        // 2. Cooldown check (Rate Limit)
        const COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes
        if (user.lastVerificationAttempt && (Date.now() - new Date(user.lastVerificationAttempt).getTime() < COOLDOWN_MS)) {
            const timeLeft = Math.ceil((COOLDOWN_MS - (Date.now() - new Date(user.lastVerificationAttempt).getTime())) / 1000 / 60)
            return res.json({
                success: false,
                message: `Verification rate limit: Please wait ${timeLeft} minutes before trying again.`
            })
        }

        // 3. Check if all four documents are uploaded
        if (!user.idCardFront || !user.idCardBack || !user.licenseFront || !user.licenseBack) {
            return res.json({ 
                success: false, 
                message: "Please upload your ID Front, ID Back, License Front, and License Back documents before starting verification." 
            })
        }

        // 4. Check if other profile fields are filled
        if (!user.name || user.name.trim() === '' || 
            !user.dob || user.dob === 'Not Selected' || 
            !user.idNumber || user.idNumber === 'Not Selected' || 
            !user.licenseNumber || user.licenseNumber === 'Not Selected') {
            return res.json({
                success: false,
                message: "Please fill in your Full Name, Date of Birth, National ID / Passport number, and Driving License number in your profile details first."
            })
        }

        // 5. Document Uniqueness Check
        const duplicateUser = await User.findOne({
            _id: { $ne: _id },
            verificationStatus: 'verified',
            $or: [
                { idNumber: user.idNumber },
                { licenseNumber: user.licenseNumber }
            ]
        })
        if (duplicateUser) {
            return res.json({
                success: false,
                message: "This ID number or Driving License number is already verified on another account."
            })
        }

        const newAttempts = (user.verificationAttempts || 0) + 1
        const shouldLock = newAttempts >= 5

        // Update status to pending and save attempts
        await User.findByIdAndUpdate(_id, { 
            verificationStatus: 'pending',
            verificationError: '',
            verificationReport: '',
            verificationAttempts: newAttempts,
            verificationLocked: shouldLock,
            lastVerificationAttempt: new Date()
        })

        // Call Groq Vision
        const openai = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1'
        });

        const currentDateStr = new Date().toLocaleDateString();

        // Parallel Multi-Pass AI Verification
        const [responseA, responseB] = await Promise.all([
            // Pass A: Structured Extraction
            openai.chat.completions.create({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Extract the details from the attached user identity and driving license documents.
Return ONLY a JSON object with:
{
  "extractedName": "Full name found on documents",
  "extractedDob": "Date of birth found (Format: YYYY-MM-DD or DD/MM/YYYY)",
  "extractedIdNumber": "National ID or Passport number",
  "extractedLicenseNumber": "Driving License number",
  "isLegible": true or false,
  "unreadableReason": "Explanation if documents are unreadable or blurry, else empty string"
}`
                            },
                            { type: 'image_url', image_url: { url: user.idCardFront } },
                            { type: 'image_url', image_url: { url: user.idCardBack } },
                            { type: 'image_url', image_url: { url: user.licenseFront } },
                            { type: 'image_url', image_url: { url: user.licenseBack } }
                        ]
                    }
                ]
            }),
            // Pass B: Detailed Compliance Audit
            openai.chat.completions.create({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `You are a professional KYC document verification system.
Your job is to analyze the attached user identification documents and verify that the information matches the profile details.

USER PROFILE DETAILS TO CHECK:
- Full Name: ${user.name}
- Date of Birth: ${user.dob}
- National ID / Passport Number: ${user.idNumber}
- Driving License Number: ${user.licenseNumber}

Verify the following rules:
1. Valid documents: Are these readable and actual ID/License images?
2. Same person: Do all documents belong to the exact same person?
3. Expiration: Are the documents currently expired? (Current Date is ${currentDateStr}).

Return ONLY a JSON object with:
{
  "status": "verified" or "rejected",
  "report": "A detailed audit compliance report in Markdown format, with sections for: Documents Readability, Detail Comparison, Expiration Checks, and Verification Summary. Be professional.",
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
            })
        ]);

        const resultAJsonStr = responseA.choices[0].message.content;
        const resultBJsonStr = responseB.choices[0].message.content;

        console.log("AI Pass A Extraction:", resultAJsonStr);
        console.log("AI Pass B Verification:", resultBJsonStr);

        let resultA, resultB;
        try { resultA = JSON.parse(resultAJsonStr); } catch (e) { resultA = { isLegible: false, unreadableReason: 'Failed parsing extraction response' }; }
        try { resultB = JSON.parse(resultBJsonStr); } catch (e) { resultB = { status: 'rejected', error: 'Failed parsing verification response', report: resultBJsonStr }; }

        let finalStatus = resultB.status === 'verified' ? 'verified' : 'rejected';
        let finalError = resultB.error || '';
        let finalReport = resultB.report || 'Verification report could not be generated.';

        // Programmatic cross-check of Pass A's extracted values to prevent AI comparison failure
        if (finalStatus === 'verified') {
            if (!resultA.isLegible) {
                finalStatus = 'rejected';
                finalError = resultA.unreadableReason || 'Documents are unreadable or blurry.';
            } else {
                // helper to normalize numbers/strings
                const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
                const normUserID = normalize(user.idNumber);
                const normUserLicense = normalize(user.licenseNumber);
                const normExtID = normalize(resultA.extractedIdNumber);
                const normExtLicense = normalize(resultA.extractedLicenseNumber);

                if (normExtID && normUserID !== normExtID) {
                    finalStatus = 'rejected';
                    finalError = `National ID number mismatch. Profile expects ${user.idNumber} but document shows ${resultA.extractedIdNumber}.`;
                } else if (normExtLicense && normUserLicense !== normExtLicense) {
                    finalStatus = 'rejected';
                    finalError = `Driving license number mismatch. Profile expects ${user.licenseNumber} but document shows ${resultA.extractedLicenseNumber}.`;
                }
            }
        }

        const dateNow = new Date();
        const actionText = finalStatus === 'verified' ? 'Verification Successful' : 'Verification Rejected';
        
        // Add to history log
        const historyEntry = {
            date: dateNow,
            status: finalStatus,
            action: actionText,
            reason: finalStatus === 'verified' ? 'All checks passed.' : finalError
        };

        const updatedUser = await User.findByIdAndUpdate(_id, {
            verificationStatus: finalStatus,
            verificationReport: finalReport,
            verificationError: finalError,
            verifiedAt: finalStatus === 'verified' ? dateNow : user.verifiedAt,
            $push: { verificationHistory: historyEntry }
        }, { new: true });

        // Trigger Mock Email notifier
        await sendVerificationEmail(user.email, user.name, finalStatus, finalError);

        res.json({ 
            success: true, 
            message: finalStatus === 'verified' ? "Verification Succeeded!" : "Verification Failed.",
            user: updatedUser
        });

    } catch (error) {
        console.error("Verification error:", error.message);
        const errorEntry = {
            date: new Date(),
            status: 'rejected',
            action: 'System Error',
            reason: `Internal system error: ${error.message}`
        };
        try {
            await User.findByIdAndUpdate(req.user._id, { 
                verificationStatus: 'rejected', 
                verificationError: `Internal verification error: ${error.message}`,
                $push: { verificationHistory: errorEntry }
            });
        } catch (e) {}

        res.json({ success: false, message: error.message })
    }
}

// Withdraw from Wallet (Option 4: Direct Instant)
export const withdrawWallet = async (req, res) => {
    try {
        const { _id } = req.user;
        const { amount, method, details, walletType = 'renter' } = req.body;

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.json({ success: false, message: "Please enter a valid amount" });
        }

        const minAmount = walletType === 'owner' ? 5000 : 100;
        const maxAmount = walletType === 'owner' ? 30000 : 5000;

        // Limit validations
        if (numAmount < minAmount) {
            return res.json({ success: false, message: `Minimum withdrawal limit is ${minAmount.toLocaleString()} EGP` });
        }
        if (numAmount > maxAmount) {
            return res.json({ success: false, message: `Maximum withdrawal limit per transaction is ${maxAmount.toLocaleString()} EGP` });
        }

        if (!method || !details || details.trim() === '') {
            return res.json({ success: false, message: "Payout method and destination details are required" });
        }

        const user = await User.findById(_id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const balanceField = walletType === 'owner' ? 'ownerWallet' : 'wallet';
        if (user[balanceField] < minAmount) {
            return res.json({ success: false, message: `A minimum balance of ${minAmount.toLocaleString()} EGP is required to withdraw funds. Current balance: ${user[balanceField]} EGP` });
        }

        if (user[balanceField] < numAmount) {
            return res.json({ success: false, message: `Insufficient balance. Current balance: ${user[balanceField]} EGP` });
        }

        // Check if user has already made a withdrawal in the last 24 hours (only for renter wallet)
        if (walletType === 'renter') {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const existingWithdrawal = await Withdrawal.findOne({
                user: _id,
                walletType: 'renter',
                status: { $ne: "Failed" },
                createdAt: { $gte: oneDayAgo }
            });

            if (existingWithdrawal) {
                return res.json({ success: false, message: "You can only make one withdrawal per day." });
            }
        } else if (walletType === 'owner') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const existingWithdrawal = await Withdrawal.findOne({
                user: _id,
                walletType: 'owner',
                status: { $ne: "Failed" },
                createdAt: { $gte: sevenDaysAgo }
            });

            if (existingWithdrawal) {
                return res.json({ success: false, message: "You can only withdraw once a week. Please wait until next week to withdraw again." });
            }
        }

        // Deduct balance and create withdrawal entry
        user[balanceField] -= numAmount;
        await user.save();

        const withdrawal = await Withdrawal.create({
            user: _id,
            amount: numAmount,
            method,
            details,
            status: "Completed", // Instant completed for Option 4
            walletType
        });

        res.json({
            success: true,
            message: "Withdrawal completed successfully!",
            user: { wallet: user.wallet, ownerWallet: user.ownerWallet }, // return updated user wallet
            withdrawal
        });

    } catch (error) {
        console.error("Withdrawal error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get User Withdrawals
export const getUserWithdrawals = async (req, res) => {
    try {
        const { _id } = req.user;
        const { walletType } = req.query;

        const filter = { user: _id };
        if (walletType) {
            filter.walletType = walletType;
        }

        const withdrawals = await Withdrawal.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, withdrawals });
    } catch (error) {
        console.error("Get withdrawals error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Forgot Password - Send Code
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Generate 6-digit random code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry set to 15 minutes from now
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        user.resetCode = code;
        user.resetCodeExpiry = expiry;
        await user.save();

        console.log(`[Forgot Password] Verification code for ${email} is: ${code}`);

        // Return code in response for testing/mock purposes so the user can easily see it
        res.json({ success: true, message: "Verification code sent!", code });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.json({ success: false, message: "All fields are required" });
        }
        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.resetCode || user.resetCode !== code) {
            return res.json({ success: false, message: "Invalid verification code" });
        }

        if (new Date() > user.resetCodeExpiry) {
            return res.json({ success: false, message: "Verification code expired" });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpiry = null;
        await user.save();

        res.json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Log Viewed Car
export const logViewedCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        if (!carId) {
            return res.json({ success: false, message: "Car ID is required" });
        }

        const user = await User.findById(_id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Remove the carId if it already exists to move it to the end
        user.viewedCars = user.viewedCars.filter(id => id.toString() !== carId);
        
        // Add to the end
        user.viewedCars.push(carId);

        // Keep only the last 20 viewed cars
        if (user.viewedCars.length > 20) {
            user.viewedCars = user.viewedCars.slice(-20);
        }

        await user.save();
        res.json({ success: true, message: "Car view logged successfully" });

    } catch (error) {
        console.error("Log viewed car error:", error.message);
        res.json({ success: false, message: error.message });
    }
}