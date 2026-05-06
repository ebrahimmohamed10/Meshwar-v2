import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import chatbotRouter from "./routes/chatbotRoutes.js";
import { startAutoCancelJob } from "./utils/autoCancelJob.js";
import adminRouter from "./routes/adminRoute.js";
import pricingRouter from "./routes/pricingRoutes.js";

// Initialize Express App
// Force restart to apply auto-cancel UTC fix
const app = express()

// Connect Database
await connectDB()

// Start Background Jobs
startAutoCancelJob()

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware to check Database Connection Status
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
            success: false, 
            message: "Database is not connected. Please check your MongoDB Atlas IP Whitelist and your internet connection." 
        });
    }
    next();
});

app.get('/', (req, res)=> res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/chatbot', chatbotRouter)
app.use('/api/admin', adminRouter)
app.use('/api/pricing', pricingRouter)
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))