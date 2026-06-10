import Booking from '../models/Booking.js';
import User from '../models/User.js';

/**
 * Automatically cancels same-day bookings that haven't been responded to within 6 hours.
 * Refunds the booking price to the user's wallet.
 */
const autoCancelSameDayBookings = async () => {
    try {
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        // Find pending bookings created more than 6 hours ago
        // We only care about 'pending' ones.
        const pendingBookings = await Booking.find({
            status: 'pending',
            createdAt: { $lte: sixHoursAgo }
        });

        if (pendingBookings.length === 0) return;

        console.log(`[Auto-Cancel] Checking ${pendingBookings.length} pending bookings...`);

        for (const booking of pendingBookings) {
            const pickupDate = new Date(booking.pickupDate);
            const createdDate = new Date(booking.createdAt);

            // Check if it's a same-day booking 
            // (The user wants to rent the car on the same day they made the request)
            const isSameDay = pickupDate.getFullYear() === createdDate.getFullYear() &&
                             pickupDate.getMonth() === createdDate.getMonth() &&
                             pickupDate.getDate() === createdDate.getDate();

            if (isSameDay) {
                // 1. Update Booking Status
                booking.status = 'cancelled';
                booking.cancellationReason = 'Automatic cancellation: Owner did not respond within 6 hours for a same-day booking.';
                await booking.save();

                // 2. Refund User Wallet
                // Assuming 'price' is the amount paid or authorized
                await User.findByIdAndUpdate(booking.user, {
                    $inc: { wallet: booking.price }
                });

                console.log(`[Auto-Cancel] Success: Cancelled same-day booking ${booking._id} for user ${booking.user}. Refunded ${booking.price} EGP.`);
            }
        }
    } catch (error) {
        console.error('[Auto-Cancel] Error executing job:', error);
    }
};

// Initialize the interval (runs every 15 minutes)
export const startAutoCancelJob = () => {
    console.log('[Auto-Cancel] Background job initialized (15m interval).');
    // Run immediately on start
    autoCancelSameDayBookings();
    // Then every 15 minutes
    setInterval(autoCancelSameDayBookings, 15 * 60 * 1000);
};
