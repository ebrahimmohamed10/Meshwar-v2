import Booking from "../models/Booking.js"
import Car from "../models/Car.js";
import User from "../models/User.js";


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
        const { car, pickupDate, returnDate, paymentMethod } = req.body;

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
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1
        const price = carData.pricePerDay * noOfDays;

        // Handle Wallet Payment
        if (paymentMethod === 'Wallet') {
            const user = await User.findById(_id)
            if (user.wallet < price) {
                return res.json({ success: false, message: "Insufficient wallet balance" })
            }
            await User.findByIdAndUpdate(_id, { $inc: { wallet: -price } })
        }

        await Booking.create({ car, owner: carData.owner, user: _id, pickupDate, returnDate, price, paymentMethod: paymentMethod || 'offline' })

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
        const { bookingId, status } = req.body

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

        if (status === 'confirmed') {
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