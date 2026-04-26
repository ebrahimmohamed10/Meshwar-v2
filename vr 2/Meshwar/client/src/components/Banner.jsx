import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Banner = () => {
    const navigate = useNavigate()
    const { user, setShowLogin, isPremium } = useAppContext()

    const handleListCars = () => {
        if (!user) {
            toast.error('Please login or create an account to list your car');
            setShowLogin(true);
            return;
        }
        isPremium ? navigate('/owner') : navigate('/checkout/premium');
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className='relative mx-4 md:mx-auto max-w-6xl rounded-[2.5rem] overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl group my-12'
        >
            {/* Dynamic Abstract Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/30 via-gray-900 to-gray-900" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            
            {/* Glowing Orbs */}
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" 
            />
            <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" 
            />

            {/* Content Container */}
            <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between px-8 md:pl-16 pt-12 md:pt-0 gap-10 min-h-[420px]'>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className='text-white max-w-xl py-12 flex flex-col justify-center'
                >
                    {/* Premium Badge */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="self-start inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/20 border border-primary/30 backdrop-blur-md text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-[0_0_15px_rgba(22,163,74,0.2)]"
                    >
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        Become a Partner
                    </motion.div>

                    <h2 className='text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white mb-4'>
                        Turn Your Car Into an <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            Earning Asset
                        </span>
                    </h2>
                    
                    <p className='text-gray-300 text-lg leading-relaxed max-w-md mb-8 font-light'>
                        Join our exclusive fleet. We handle insurance, driver verification, and secure payments — so you can earn stress-free passive income.
                    </p>

                    {/* Features List */}
                    <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-medium text-gray-200">
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span> Verified Drivers
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span> Full Insurance
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span> Instant Payouts
                        </span>
                    </div>

                    {/* Main CTA */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleListCars}
                        className='self-start relative group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl text-base cursor-pointer shadow-[0_10px_30px_rgba(22,163,74,0.4)] hover:shadow-[0_10px_40px_rgba(22,163,74,0.6)] transition-all overflow-hidden'
                    >
                        <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
                        <span className="relative z-10 flex items-center gap-2">
                            {isPremium ? 'Go to Owner Dashboard' : 'Start Earning Today'}
                            {!isPremium && (
                                <span className="ml-2 flex items-center gap-1 bg-white/20 text-white border border-white/30 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    PREMIUM
                                </span>
                            )}
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </span>
                    </motion.button>
                </motion.div>

                {/* Car Image with Glow */}
                <div className="relative md:w-1/2 flex justify-end items-end h-full mt-auto md:mt-10">
                    {/* Reflection/Glow under car */}
                    <div className="absolute bottom-10 right-10 w-[80%] h-20 bg-emerald-500/40 blur-[60px] rounded-[100%] pointer-events-none" />
                    
                    <motion.img
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
                        viewport={{ once: true }}
                        src={assets.banner_car_image}
                        alt="Luxury Car"
                        className='relative z-10 w-full max-w-lg object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-transform duration-700 pointer-events-none'
                    />
                </div>
            </div>
        </motion.section>
    )
}

export default Banner
