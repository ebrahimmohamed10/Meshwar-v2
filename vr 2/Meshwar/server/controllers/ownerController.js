import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";


// API to Change Role of User
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" })
        res.json({ success: true, message: "Now you can list cars" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to List Car

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // Fetch full user details to check verification status and completed fields/documents
        const user = await User.findById(_id);
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        const requiredFields = ['phone', 'idNumber', 'licenseNumber', 'job', 'nationality', 'gender'];
        const missingFields = requiredFields.filter(f => !user[f] || user[f] === 'Not Selected');
        
        const hasMissingDoc = !user.idCardFront || !user.idCardBack || !user.licenseFront || !user.licenseBack;

        if (missingFields.length > 0 || hasMissingDoc) {
            return res.json({ 
                success: false, 
                message: "Please complete your profile and upload all required documents (ID card front/back and driving license front/back) first before listing a car." 
            });
        }

        if (user.verificationStatus !== 'verified') {
            let message = "Please complete identity verification under 'My Account' before listing a car.";
            if (user.verificationStatus === 'pending') {
                message = "Your verification is currently in progress. Please wait for the AI review to complete before listing a car.";
            } else if (user.verificationStatus === 'rejected') {
                message = `Your identity verification was rejected: ${user.verificationError || 'Invalid details'}. Please update your details/documents under 'My Account' before listing a car.`;
            }
            return res.json({ success: false, message });
        }

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' }, // Width resizing
                { quality: 'auto' }, // Auto compression
                { format: 'webp' }  // Convert to modern format
            ]
        });

        const image = optimizedImageUrl;
        await Car.create({ ...car, owner: _id, image, status: 'pending' })

        res.json({ success: true, message: "Car added successfully! Waiting for Admin Approval." })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to List Owner Cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        res.json({ success: true, cars })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save()

        res.json({ success: true, message: "Availability Toggled" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Api to delete a car
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);

        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }

        // Checking if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Car.findByIdAndDelete(carId);

        res.json({ success: true, message: "Car deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API to update a car
export const updateCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let carData = JSON.parse(req.body.carData);
        const imageFile = req.file;

        const car = await Car.findById(carData._id);

        // Checking if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        let image = car.image; // Keep existing image by default

        // If a new image is provided, upload it to ImageKit
        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: '/cars'
            });

            image = imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: '1280' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            });
        }

        await Car.findByIdAndUpdate(carData._id, { ...carData, image });

        res.json({ success: true, message: "Car Updated Successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API to get Dashboard Data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner' && !req.user.isPremium) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const cars = await Car.find({ owner: _id })
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({ owner: _id, status: "pending" })
        const completedBookings = await Booking.find({ owner: _id, status: "confirmed" })

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to update user image

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;

        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '400' }, // Width resizing
                { quality: 'auto' }, // Auto compression
                { format: 'webp' }  // Convert to modern format
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, { image });
        res.json({ success: true, message: "Image Updated" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}   