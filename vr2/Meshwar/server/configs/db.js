import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        mongoose.set('bufferCommands', false);
        mongoose.connection.on('connected', ()=> console.log("✅ Database Connected Successfully"));
        mongoose.connection.on('error', (err)=> console.log("❌ Database Error:", err.message));
        
        console.log("🔗 Attempting to connect to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'car-rental',
            serverSelectionTimeoutMS: 10000
        });
    } catch (error) {
        console.log("🛑 Connection Failed:", error.message);
    }
}

export default connectDB;