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
            req.user = user;
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" })
    }
}