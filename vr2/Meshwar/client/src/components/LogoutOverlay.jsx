import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

// ── Floating particles that drift downwards ──
const DownwardParticles = () => {
    const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 2,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-primary/10"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: [0, 50, 100],
                        opacity: [0, 0.4, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

const LogoutOverlay = () => {
    const { user } = useAppContext();
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Transition messages at 1.1s (when the car completes parking)
        const textTimer = setTimeout(() => {
            setStep(2);
        }, 1100);

        return () => {
            clearTimeout(textTimer);
        };
    }, []);

    const userName = user?.name || "Traveler";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.65), rgba(15,23,42,0.45))' }}
        >
            <DownwardParticles />

            <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[400px] relative"
            >
                {/* Brand-green gradient border */}
                <div
                    className="absolute -inset-[1px] rounded-2xl opacity-60"
                    style={{
                        background: 'linear-gradient(135deg, #3c9e7a, #34d399, #3c9e7a, #34d399)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 4s ease infinite',
                    }}
                />

                {/* Card Container */}
                <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_rgba(60,158,122,0.1),_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden">
                    
                    {/* Top Accent Line */}
                    <motion.div
                        className="h-[3px] w-full"
                        style={{
                            background: 'linear-gradient(90deg, #3c9e7a, #34d399, #10b981, #3c9e7a)',
                            backgroundSize: '200% 100%',
                        }}
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="px-8 py-10 flex flex-col items-center text-center">
                        
                        {/* ── Journey Complete Parking Scene ── */}
                        <div className="w-full h-28 bg-gray-50/60 rounded-xl relative overflow-hidden border border-gray-100/50 mb-6">
                            
                            {/* Road */}
                            <div className="absolute bottom-6 left-4 right-4 h-[1.5px] bg-gray-200/80 rounded-full" />
                            
                            {/* Dotted Lane Dividers */}
                            <div className="absolute bottom-[10px] left-6 right-6 flex gap-2">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className="h-[1px] w-2 bg-gray-300/50 rounded-full" />
                                ))}
                            </div>

                            {/* Parking Slot Outline (P) */}
                            <div className="absolute bottom-3 right-8 w-16 h-10 border border-dashed border-primary/30 bg-primary/[0.01] rounded-md flex items-center justify-center">
                                <span className="text-[10px] font-black text-gray-300 tracking-widest select-none">P</span>
                            </div>

                            {/* Decelerating/Parking Car Container */}
                            <motion.div
                                className="absolute bottom-5 flex items-center"
                                initial={{ x: -50 }}
                                animate={{ x: 236 }} // Center inside the parking slot
                                transition={{ duration: 1.1, ease: "easeOut" }}
                            >
                                <div className="relative">
                                    {/* Car Headlights / Light Beam (Fades out when parked) */}
                                    <motion.div
                                        className="absolute -right-16 -top-4 w-16 h-10 pointer-events-none origin-left"
                                        initial={{ opacity: 0.8 }}
                                        animate={{ opacity: 0 }}
                                        transition={{ delay: 1.1, duration: 0.25 }}
                                        style={{
                                            background: 'radial-gradient(ellipse at left, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0) 75%)',
                                            clipPath: 'polygon(0 35%, 100% 0, 100% 100%, 0 65%)'
                                        }}
                                    />
                                    
                                    {/* Headlight Source Glows */}
                                    <motion.div
                                        className="absolute -right-0.5 top-1.5 w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(251,191,36,0.8)]"
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 0 }}
                                        transition={{ delay: 1.1, duration: 0.2 }}
                                    />

                                    {/* Car Body */}
                                    <svg width="42" height="18" viewBox="0 0 36 16" fill="none" className="text-primary drop-shadow-sm">
                                        <path
                                            d="M4 12h2a2 2 0 104 0h8a2 2 0 104 0h5c2 0 3-1 3-3V7c0-1-0.5-2-1.5-2.5L26 3l-4-2H12L8 3 4.5 4.5C3.5 5 3 6 3 7v2c0 2 1 3 1 3z"
                                            fill="currentColor"
                                        />
                                        <circle cx="8" cy="12" r="2" fill="#1f2937" />
                                        <circle cx="20" cy="12" r="2" fill="#1f2937" />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Drop-down Lock visual above parking slot */}
                            <motion.div
                                className="absolute right-[50px] top-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20 z-10"
                                initial={{ scale: 0, opacity: 0, y: -15 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.35, type: "spring" }}
                            >
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    {/* Shackle closing */}
                                    <motion.path
                                        d="M8 11V7a4 4 0 118 0v4"
                                        stroke="white"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ y: -2 }}
                                        animate={{ y: 0 }}
                                        transition={{ delay: 1.4, type: "spring", stiffness: 220, damping: 9 }}
                                    />
                                </svg>
                            </motion.div>

                            {/* Concentric soundwaves expanding when lock clicks */}
                            <motion.div
                                className="absolute right-[45px] top-2.5 w-8 h-8 rounded-full border border-primary/40 pointer-events-none"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.8, opacity: [0, 0.7, 0] }}
                                transition={{ delay: 1.4, duration: 0.5 }}
                            />
                        </div>

                        {/* ── Visual Message Display ── */}
                        <div className="h-16 flex flex-col justify-center mb-1">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step-completing"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            Parking the car...
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            Locking up the ride for <span className="font-semibold text-primary">{userName}</span>
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step-parked"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            Safe Travels!
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            Your session is safely parked. See you on the next ride!
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Progress Loading Bar ── */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                            />
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* Shift background gradient matching Login style */}
            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </motion.div>
    );
};

export default LogoutOverlay;
