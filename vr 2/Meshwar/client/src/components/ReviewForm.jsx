import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

const ReviewForm = ({ isOpen, onClose, onReviewAdded, initialData = null }) => {
    const { axios, user, token, setShowLogin } = useAppContext();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [category, setCategory] = useState('experience');
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(0);
    const [isVerified, setIsVerified] = useState(false);

    // Initialize form with existing data if editing
    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating);
            setComment(initialData.comment);
            setCategory(initialData.category);
        } else {
            // Reset for new review
            setRating(5);
            setComment('');
            setCategory('experience');
        }
    }, [initialData, isOpen]);

    // Check verification status when modal opens
    useEffect(() => {
        if (isOpen && token) {
            checkVerification();
        }
    }, [isOpen, token]);

    const checkVerification = async () => {
        try {
            const { data } = await axios.get('/api/bookings/user');
            if (data.success) {
                const hasConfirmed = data.bookings.some(b => b.status === 'confirmed');
                setIsVerified(hasConfirmed);
            }
        } catch (error) {
            console.error("Verification check failed", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            toast.error("Please login to leave a review");
            setShowLogin(true);
            return;
        }

        if (comment.trim().length < 10) {
            toast.error("Please write at least 10 characters");
            return;
        }

        setLoading(true);
        try {
            let data;
            if (initialData) {
                // Update existing review
                const response = await axios.put('/api/reviews/update', {
                    reviewId: initialData._id,
                    rating,
                    comment,
                    category
                });
                data = response.data;
            } else {
                // Add new review
                const response = await axios.post('/api/reviews/add', {
                    rating,
                    comment,
                    category
                });
                data = response.data;
            }

            if (data.success) {
                toast.success(initialData ? "Review updated!" : "Thank you! Your verified review is live.");
                setComment('');
                setRating(5);
                onReviewAdded();
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row"
                    >
                        {/* Sidebar Info (Hidden on mobile) */}
                        <div className="hidden md:flex md:w-48 bg-slate-50 border-r border-slate-100 p-8 flex-col justify-between">
                            <div className="space-y-8">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tips</p>
                                    <ul className="text-xs font-bold text-slate-500 space-y-3 leading-relaxed">
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span> Mention car condition
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span> Note delivery speed
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span> App experience
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            
                            {isVerified && (
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-[10px] font-bold text-emerald-500 leading-tight">You'll receive a Verified badge!</p>
                                </div>
                            )}
                        </div>

                        {/* Main Form */}
                        <div className="flex-1 p-8 md:p-12">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Feedback</h2>
                                    <p className="text-slate-400 font-medium mt-1">We read every single review.</p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Rating Stars */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Quality Score</label>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                className="focus:outline-none group"
                                            >
                                                <motion.img 
                                                    animate={{ scale: (hover || rating) >= star ? 1.2 : 1 }}
                                                    src={assets.star_icon} 
                                                    alt="star" 
                                                    className={`w-10 h-10 transition-all duration-300 ${
                                                        (hover || rating) >= star ? 'opacity-100' : 'opacity-10 grayscale'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Area</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['experience', 'website', 'service', 'other'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                                                    category === cat 
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="space-y-3 relative">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Message</label>
                                        <span className={`text-[10px] font-bold ${comment.length < 10 ? 'text-slate-300' : 'text-primary'}`}>
                                            {comment.length} / 500
                                        </span>
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value.slice(0, 500))}
                                        placeholder="I had an amazing experience with the BMW X5..."
                                        className="w-full h-32 px-6 py-5 rounded-[30px] bg-slate-50 border-none focus:ring-4 focus:ring-primary/5 transition-all duration-300 outline-none resize-none text-slate-700 font-medium placeholder:text-slate-300"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || comment.length < 10}
                                    className="w-full py-5 bg-primary text-white rounded-[30px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Post Review</span>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewForm;
