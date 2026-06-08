import Booking from "../models/Booking.js"
import Car from "../models/Car.js";
import User from "../models/User.js";
import SystemSettings from "../models/SystemSettings.js";
import { calculateDynamicPrice } from "../utils/pricingEngine.js";

// Function to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate) => {
    // Overlapping requests are now allowed to give owners full control.
    // Availability is now handled at the approval stage.
    return true;
}

// Helper to auto-cancel pending bookings if pickup date has passed
const autoCancelExpiredBookings = async () => {
    try {
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        // Use UTC for today's start to match DB storage
        const startOfTodayUTC = new Date();
        startOfTodayUTC.setUTCHours(0, 0, 0, 0);

        // Find pending bookings where:
        // 1. The pickup date is strictly in the past (before today UTC)
        // 2. OR the pickup date is today UTC AND the booking was created more than 6 hours ago
        const expiredBookings = await Booking.find({
            status: 'pending',
            $or: [
                { pickupDate: { $lt: startOfTodayUTC } },
                {
                    pickupDate: { $gte: startOfTodayUTC, $lt: new Date(startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000) },
                    createdAt: { $lte: sixHoursAgo }
                }
            ]
        });

        for (const booking of expiredBookings) {
            // Refund to wallet (applies to all five payment methods)
            if (booking.paymentMethod !== 'offline') {
                await User.findByIdAndUpdate(booking.user, { $inc: { wallet: booking.price } });
            }

            booking.status = 'cancelled';
            booking.cancellationReason = "Automatic cancellation: Owner did not respond within 6 hours for a same-day booking (or pickup date passed).";
            await booking.save();
        }
    } catch (error) {
        console.error("Auto-cancel error:", error.message);
    }
}

// API to Check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body

        // fetch all available cars for the given location
        const cars = await Car.find({ location, isAvaliable: true })

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
            return { ...car._doc, isAvailable: isAvailable }
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true)

        res.json({ success: true, availableCars })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to Create Booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate, paymentMethod, pickupLocation, returnLocation } = req.body;

        // Validate pickup and return locations
        if (!pickupLocation || !pickupLocation.trim()) {
            return res.json({ success: false, message: "Pickup location is required." });
        }
        if (!returnLocation || !returnLocation.trim()) {
            return res.json({ success: false, message: "Return location is required." });
        }

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
                message: "Please complete your profile and upload all required documents (ID card front/back and driving license front/back) first." 
            });
        }

        if (user.verificationStatus !== 'verified') {
            let message = "Please complete identity verification under 'My Account' before booking.";
            if (user.verificationStatus === 'pending') {
                message = "Your verification is currently in progress. Please wait for the AI review to complete.";
            } else if (user.verificationStatus === 'rejected') {
                message = `Your identity verification was rejected: ${user.verificationError || 'Invalid details'}. Please update your details/documents under 'My Account'.`;
            }
            return res.json({ success: false, message });
        }

        // Server-side validation for dates
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (picked < tomorrow) {
            return res.json({ success: false, message: "Bookings must start at least from tomorrow." })
        }

        if (returned <= picked) {
            return res.json({ success: false, message: "Return date must be at least one day after pickup date." })
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available" })
        }

        const carData = await Car.findById(car)

        // Calculate price based on pickupDate and returnDate
        let price, priceBreakdown;
        if (carData.dynamicPricingEnabled) {
            const pricing = await calculateDynamicPrice({ carId: car, pickupDate, returnDate });
            price = pricing.totalPrice;
            priceBreakdown = pricing.breakdown;
        } else {
            const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1;
            price = carData.pricePerDay * noOfDays;
            priceBreakdown = null;
        }

        // Handle Wallet Payment
        if (paymentMethod === 'Wallet') {
            const user = await User.findById(_id)
            if (user.wallet < price) {
                return res.json({ success: false, message: "Insufficient wallet balance" })
            }
            await User.findByIdAndUpdate(_id, { $inc: { wallet: -price } })
        }

        await Booking.create({ 
            car, 
            owner: carData.owner, 
            user: _id, 
            pickupDate, 
            returnDate, 
            price, 
            priceBreakdown,
            paymentMethod: paymentMethod || 'offline',
            pickupLocation: pickupLocation.trim(),
            returnLocation: returnLocation.trim()
        })

        res.json({ success: true, message: "Booking Created" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to List User Bookings 
export const getUserBookings = async (req, res) => {
    try {
        await autoCancelExpiredBookings();
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({ createdAt: -1 })
        res.json({ success: true, bookings })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to get Owner Bookings

export const getOwnerBookings = async (req, res) => {
    try {
        await autoCancelExpiredBookings();
        if (req.user.role !== 'owner' && !req.user.isPremium) {
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({ owner: req.user._id }).populate('car user').select("-user.password").sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status, rejectionReason } = req.body

        const booking = await Booking.findById(bookingId)

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }

        if (status === 'rejected' && booking.status === 'pending') {
            // Refund to wallet (applies to all five payment methods)
            if (booking.paymentMethod !== 'offline') {
                await User.findByIdAndUpdate(booking.user, { $inc: { wallet: booking.price } })
            }
        }

        if (status === 'confirmed' && booking.status !== 'confirmed') {
            // Generate a 4-digit handover PIN — money transfers ONLY after PIN verification
            const pin = String(Math.floor(1000 + Math.random() * 9000));
            booking.handoverPin = pin;
            booking.handoverVerified = false;

            // Automatically cancel and refund ALL other bookings (pending OR confirmed) that overlap with this new confirmation
            const conflictingBookings = await Booking.find({
                _id: { $ne: bookingId },
                car: booking.car,
                status: { $in: ['pending', 'confirmed'] },
                pickupDate: { $lte: booking.returnDate },
                returnDate: { $gte: booking.pickupDate }
            });

            for (const conflict of conflictingBookings) {
                if (conflict.paymentMethod !== 'offline') {
                    await User.findByIdAndUpdate(conflict.user, { $inc: { wallet: conflict.price } });
                }
                conflict.status = 'cancelled';
                conflict.cancellationReason = "Cancelled due to a scheduling conflict with another booking approved by the owner.";
                await conflict.save();
            }
        }

        booking.status = status;
        if (status === 'rejected' && rejectionReason) {
            booking.cancellationReason = rejectionReason;
        }
        await booking.save();

        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// API to Cancel a Booking (user only, and only if status is 'pending')
export const cancelBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Only the user who made the booking can cancel it
        if (booking.user.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Only allow cancellation when status is pending
        if (booking.status !== "pending") {
            return res.json({ success: false, message: "Only pending bookings can be cancelled" });
        }

        // Refund to wallet (applies to all five payment methods)
        if (booking.paymentMethod !== 'offline') {
            await User.findByIdAndUpdate(booking.user, { $inc: { wallet: booking.price } });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, message: "Booking cancelled successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API to verify the handover PIN and release payment to owner
export const verifyHandoverPin = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, pin } = req.body;

        if (!bookingId || !pin) {
            return res.json({ success: false, message: "Booking ID and PIN are required." });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({ success: false, message: "Booking not found." });
        }

        // Only the owner of this booking can verify the PIN
        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized." });
        }

        if (booking.status !== 'confirmed') {
            return res.json({ success: false, message: "This booking is not in a confirmed state." });
        }

        if (booking.handoverVerified) {
            return res.json({ success: false, message: "This booking has already been verified and payment released." });
        }

        // Check PIN
        if (booking.handoverPin !== String(pin).trim()) {
            return res.json({ success: false, message: "Incorrect PIN. Please try again." });
        }

        // PIN is correct — transfer money to owner wallet (minus admin commission)
        // Read commission rate from SystemSettings (fallback to 10% if not configured)
        const settings = await SystemSettings.findOne({ key: 'global' });
        const commissionRate = settings ? settings.commissionRate : 0.10;
        const commission = Math.round(booking.price * commissionRate);
        const ownerAmount = booking.price - commission;

        if (booking.paymentMethod !== 'offline') {
            // Transfer owner's share to ownerWallet (available for withdrawal)
            await User.findByIdAndUpdate(booking.owner, { $inc: { ownerWallet: ownerAmount } });
            // Add commission to admin's wallet
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
                await User.findByIdAndUpdate(adminUser._id, { $inc: { wallet: commission } });
            }
        }

        booking.handoverVerified = true;
        booking.handoverVerifiedAt = new Date();
        await booking.save();

        res.json({ 
            success: true, 
            message: "Verified successfully! Earnings have been transferred to your wallet.",
            ownerAmount,
            commission
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API to get booked dates for a specific car (Add this at the end of the file)
export const getCarBookedDates = async (req, res) => {
    try {
        const { carId } = req.params;
        
        // بنجيب كل الحجوزات المؤكدة للعربية دي بس
        const bookings = await Booking.find({ car: carId, status: 'confirmed' });

        let bookedDates = [];

        // بنلف على الحجوزات ونطلع كل الأيام اللي بين تاريخ الاستلام والترجيع
        bookings.forEach(booking => {
            let currentDate = new Date(booking.pickupDate);
            let endDate = new Date(booking.returnDate);
            
            while (currentDate <= endDate) {
                bookedDates.push(new Date(currentDate).toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        res.json({ success: true, bookedDates });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}