import reviewModel from "../models/Review.js";
import bookingModel from "../models/Booking.js";

// Add a new review
const addReview = async (req, res) => {
    try {
        const { rating, comment, category } = req.body;
        const userId = req.user._id;

        if (!rating || !comment) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        // Check if user is verified (has a confirmed booking)
        const bookings = await bookingModel.find({ user: userId, status: 'confirmed' });
        const isVerified = bookings.length > 0;

        const newReview = new reviewModel({
            user: userId,
            rating,
            comment,
            category,
            isVerified
        });

        await newReview.save();
        res.json({ success: true, message: "Review added successfully", review: newReview });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all approved reviews
const getAllReviews = async (req, res) => {
    try {
        const { category, rating } = req.query;
        let query = { isApproved: true };

        if (category && category !== 'all') query.category = category;
        if (rating) query.rating = rating;

        const reviews = await reviewModel.find(query)
            .populate('user', 'name image')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get review statistics
const getReviewStats = async (req, res) => {
    try {
        const stats = await reviewModel.aggregate([
            { $match: { isApproved: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    starCounts: {
                        $push: "$rating"
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                stats: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: [
                        { rating: 5, percentage: 0 },
                        { rating: 4, percentage: 0 },
                        { rating: 3, percentage: 0 },
                        { rating: 2, percentage: 0 },
                        { rating: 1, percentage: 0 }
                    ]
                }
            });
        }

        const { averageRating, totalReviews, starCounts } = stats[0];
        
        const distribution = [5, 4, 3, 2, 1].map(star => {
            const count = starCounts.filter(s => s === star).length;
            return {
                rating: star,
                percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
            };
        });

        res.json({
            success: true,
            stats: {
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews,
                ratingDistribution: distribution
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { reviewId, rating, comment, category } = req.body;
        const userId = req.user._id;

        const review = await reviewModel.findById(reviewId);

        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Check if user is the owner
        if (review.user.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Not authorized to edit this review" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.category = category || review.category;

        await review.save();
        res.json({ success: true, message: "Review updated successfully", review });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const userId = req.user._id;

        const review = await reviewModel.findById(reviewId);

        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Check if user is the owner
        if (review.user.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Not authorized to delete this review" });
        }

        await reviewModel.findByIdAndDelete(reviewId);
        res.json({ success: true, message: "Review deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addReview, getAllReviews, getReviewStats, updateReview, deleteReview };
