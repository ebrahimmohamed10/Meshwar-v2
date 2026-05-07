import express from 'express';
import { addReview, getAllReviews, getReviewStats, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const reviewRouter = express.Router();

reviewRouter.post('/add', protect, addReview);
reviewRouter.get('/all', getAllReviews);
reviewRouter.get('/stats', getReviewStats);
reviewRouter.put('/update', protect, updateReview);
reviewRouter.post('/delete', protect, deleteReview);

export default reviewRouter;
