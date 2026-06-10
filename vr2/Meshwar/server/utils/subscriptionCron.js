import cron from 'node-cron';
import User from '../models/User.js';

export const startSubscriptionCronJob = () => {
    // Run at midnight every day
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log("[CRON] Running scheduled job: Expired subscription check...");
            const now = new Date();
            const result = await User.updateMany(
                {
                    isPremium: true,
                    subscriptionExpiryDate: { $lte: now }
                },
                {
                    $set: {
                        isPremium: false,
                        role: 'user',
                        subscriptionPlan: null,
                        subscriptionExpiryDate: null
                    }
                }
            );
            console.log(`[CRON] Expired subscription job completed. Downgraded ${result.modifiedCount} users.`);
        } catch (error) {
            console.error("[CRON] Error running subscription expiration job:", error.message);
        }
    });
};
