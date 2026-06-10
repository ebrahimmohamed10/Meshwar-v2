import express from "express";
import { getCars, getUserData, loginUser, registerUser, updateUserProfile, upgradeToPremium, verifyUserProfile, withdrawWallet, getUserWithdrawals, forgotPassword, resetPassword } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars)
userRouter.put('/update-profile', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'idCardFront', maxCount: 1 }, { name: 'idCardBack', maxCount: 1 }, { name: 'licenseFront', maxCount: 1 }, { name: 'licenseBack', maxCount: 1 }]), updateUserProfile)
userRouter.post('/upgrade-premium', protect, upgradeToPremium)
userRouter.post('/verify-profile', protect, verifyUserProfile)
userRouter.post('/withdraw', protect, withdrawWallet)
userRouter.get('/withdrawals', protect, getUserWithdrawals)

export default userRouter;