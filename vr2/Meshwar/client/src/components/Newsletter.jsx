import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Simulate network request for subscription
        setTimeout(() => {
            setStatus('success');
            setEmail('');

            // Revert back to normal state after showing success message
            setTimeout(() => {
                setStatus('idle');
            }, 4000);
        }, 1500);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative my-10 mb-32 mx-4 md:mx-auto max-w-4xl rounded-3xl overflow-hidden"
        >
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-emerald-50 to-white border border-primary/15 rounded-3xl" />

            <div className="relative flex flex-col items-center justify-center text-center px-6 md:px-16 py-16 gap-4">

                {/* Icon */}
                <motion.div
                    key={status === 'success' ? 'success-icon' : 'mail-icon'}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-2 shadow-sm
                        ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-primary/10'}`}
                >
                    {status === 'success' ? (
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ) : (
                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    )}
                </motion.div>

                <motion.h2
                    key={status === 'success' ? 'success-title' : 'mail-title'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900"
                >
                    {status === 'success' ? "You're on the list!" : "Never Miss a Deal!"}
                </motion.h2>

                <motion.p
                    key={status === 'success' ? 'success-desc' : 'mail-desc'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-gray-500 text-base max-w-md"
                >
                    {status === 'success'
                        ? "Thank you for subscribing! Keep an eye on your inbox for exclusive car rental discounts and offers."
                        : "Subscribe to get the latest offers, new arrivals, and exclusive discounts straight to your inbox."}
                </motion.p>

                <div className="w-full max-w-lg mt-2 min-h-[60px] flex justify-center">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success-box"
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="flex items-center justify-center gap-3 w-full bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-sm"
                            >
                                <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span className="font-medium text-sm">Subscription successful!</span>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form-box"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="flex items-center w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                            >
                                <div className="flex items-center gap-2 flex-1 px-4 py-1">
                                    <span className="text-gray-400 text-sm">✉️</span>
                                    <input
                                        className="flex-1 outline-none py-3 text-sm text-gray-600 placeholder-gray-400 bg-transparent disabled:opacity-50"
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={status === 'loading'}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !email}
                                    className="bg-primary hover:bg-primary-dull text-white px-7 py-4 text-sm font-semibold cursor-pointer shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Subscribing...
                                        </>
                                    ) : (
                                        'Subscribe'
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {status !== 'success' && (
                    <motion.p
                        key="spam-notice"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs text-gray-400 mt-1"
                    >
                        No spam, unsubscribe at any time.
                    </motion.p>
                )}
            </div>
        </motion.section>
    )
}

export default Newsletter
