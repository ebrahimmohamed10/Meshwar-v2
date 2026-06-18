import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.json({ success: false, message: "not authorized" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = typeof decoded === 'string' ? decoded : decoded.id || decoded

        if (!userId) {
            return res.json({ success: false, message: "not authorized" })
        }
        let user = await User.findById(userId).select("-password")
        if (user) {
            // Check subscription expiration
            if (user.isPremium && user.subscriptionExpiryDate && new Date() > user.subscriptionExpiryDate) {
                user.isPremium = false;
                user.role = 'user';
                user.subscriptionPlan = null;
                user.subscriptionExpiryDate = null;
                await user.save();
            }

            // Check verification license expiry
            if (user.verificationStatus === 'verified' && user.licenseExpiry && user.licenseExpiry !== 'Not Selected') {
                const expiryDate = new Date(user.licenseExpiry);
                if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
                    user.verificationStatus = 'unverified';
                    user.verificationError = 'Your driving license has expired.';
                    user.verificationReport = `### License Expiration Check\n\n- **Status**: Expired\n- **License Expiry Date**: ${user.licenseExpiry}\n- **Action Taken**: Verification reset to unverified. Please upload your renewed driving license.`;
                    user.verificationHistory.push({
                        date: new Date(),
                        status: 'unverified',
                        action: 'System Auto-Reset',
                        reason: 'Driving license expired'
                    });
                    await user.save();
                }
            }

            req.user = user;
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" })
    }
}