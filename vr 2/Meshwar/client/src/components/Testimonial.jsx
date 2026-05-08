import React, { useEffect, useState } from 'react'
import Title from './Title'
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import ReviewForm from './ReviewForm';

const Testimonial = () => {
    const { axios, user } = useAppContext();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: 'all', rating: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                axios.get('/api/reviews/all', { params: filter }),
                axios.get('/api/reviews/stats')
            ]);
            
            if (reviewsRes.data.success) setReviews(reviewsRes.data.reviews);
            if (statsRes.data.success) setStats(statsRes.data.stats);
        } catch (error) {
            console.error("Error fetching review data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const onReviewAdded = () => {
        fetchData(); // Refetch everything to update stats too
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            const { data } = await axios.post('/api/reviews/delete', { reviewId });
            if (data.success) {
                toast.success("Review deleted");
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setIsFormOpen(true);
    };

    const categories = ['all', 'experience', 'website', 'service', 'other'];
    const ratings = [5, 4, 3, 2, 1];

    return (
        <section className="py-28 px-6 md:px-16 lg:px-24 xl:px-44 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/3" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
                            Community Voice
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
                            Real Stories from <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Our Drivers.</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Experience the journeys of thousands who chose Meshwar. Every review is verified and comes from a real booking.
                        </p>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingReview(null);
                            setIsFormOpen(true);
                        }}
                        className="group relative px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest overflow-hidden transition-all duration-500 shadow-2xl shadow-slate-900/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10 flex items-center gap-3">
                            Post Your Experience
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </motion.button>
                </div>

                <div className="flex flex-col gap-16">
                    {/* Top Row: Stats & Filters Side-by-Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Bento Stats Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden h-full flex flex-col justify-center"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="text-center md:text-left shrink-0">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Overall Satisfaction</div>
                                    <div className="text-8xl font-black text-slate-900 tracking-tighter mb-4">{stats?.averageRating || '0.0'}</div>
                                    <div className="flex justify-center md:justify-start gap-1.5 mb-6">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <img 
                                                key={star} 
                                                src={assets.star_icon} 
                                                className={`w-6 h-6 ${star <= Math.round(stats?.averageRating || 0) ? '' : 'opacity-10 grayscale'}`} 
                                                alt="star"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                        From {stats?.totalReviews || 0} Global Reviews
                                    </p>
                                </div>

                                <div className="flex-1 w-full space-y-4">
                                    {stats?.ratingDistribution?.map((dist) => (
                                        <div key={dist.rating} className="flex items-center gap-4 group">
                                            <span className="text-[10px] font-black text-slate-500 w-12">{dist.rating} Stars</span>
                                            <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${dist.percentage}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900 w-8 text-right">{dist.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Filter Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-10 rounded-[40px] text-slate-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col justify-center"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Filter Experiences</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Focus Area</p>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setFilter(prev => ({ ...prev, category: cat }))}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                                    filter.category === cat 
                                                    ? 'bg-primary text-white scale-105 shadow-xl shadow-primary/30' 
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rating</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['', 5, 4, 3, 2, 1].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setFilter(prev => ({ ...prev, rating: r }))}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                                    filter.rating === r 
                                                    ? 'bg-primary text-white scale-105 shadow-xl shadow-primary/30' 
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                {r || 'Any'} {r && <img src={assets.star_icon} className={`w-2.5 h-2.5 ${filter.rating === r ? 'brightness-0 invert' : ''}`} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Row: Reviews Grid (Full Width) */}
                    <div className="w-full">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white rounded-[40px] h-[300px] animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {reviews.map((review, index) => (
                                        <motion.div
                                            key={review._id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className="group bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 relative flex flex-col"
                                        >
                                            {/* Edit/Delete Actions (Only for owner) */}
                                            {user && review.user?._id === user._id && (
                                                <div className="absolute top-6 right-6 flex gap-2 z-20">
                                                    <button 
                                                        onClick={() => handleEditReview(review)}
                                                        className="p-2 bg-slate-50 hover:bg-primary hover:text-white text-slate-400 rounded-xl transition-all duration-300"
                                                        title="Edit Review"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="p-2 bg-slate-50 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-all duration-300"
                                                        title="Delete Review"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Top Section with User & Rating */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <img 
                                                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 relative z-10" 
                                                            src={review.user?.image || assets.user_profile} 
                                                            alt={review.user?.name}
                                                            onError={(e) => e.target.src = assets.user_profile}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">
                                                            {review.user?.name || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <img 
                                                                    key={star} 
                                                                    src={assets.star_icon} 
                                                                    className={`w-3 h-3 ${star <= review.rating ? '' : 'opacity-10 grayscale'}`} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {review.isVerified && !review.user?._id === user?._id && (
                                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                        </svg>
                                                        Verified
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="mb-4">
                                                    <span className="inline-block px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">
                                                        {review.category}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-lg font-medium leading-relaxed italic line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                                                    "{review.comment}"
                                                </p>
                                            </div>

                                            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-[50px] text-center border-2 border-dashed border-slate-100">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">Discovery Awaits</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">No reviews match your specific criteria. Be the one to set the standard!</p>
                                <button 
                                    onClick={() => setFilter({ category: 'all', rating: '' })}
                                    className="text-primary font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-8"
                                >
                                    Reset Discovery Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReviewForm 
                isOpen={isFormOpen} 
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingReview(null);
                }} 
                onReviewAdded={onReviewAdded}
                initialData={editingReview}
            />
        </section>
    );
};


export default Testimonial
