import React, { useState, useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { assets } from '../assets/assets';

// ── Animated floating particles in backdrop ──
const Particles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 5 + 4,
        delay: Math.random() * 3,
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
                        y: [0, -40, 0],
                        opacity: [0, 0.5, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// ── Animated road with moving car ──
const RoadAnimation = () => (
    <div className="relative w-full h-10 overflow-hidden mb-3">
        {/* Road */}
        <div className="absolute bottom-2 left-0 right-0 h-[1.5px] bg-gray-200/60 rounded-full" />
        {/* Dashed center line */}
        <div className="absolute bottom-[8px] left-0 right-0 flex gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="h-[0.75px] w-3 bg-gray-300/60 rounded-full flex-shrink-0"
                    animate={{ x: [-10, -30] }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.03,
                    }}
                />
            ))}
        </div>
        {/* Moving car */}
        <motion.div
            className="absolute bottom-3"
            animate={{ x: ["-10%", "110%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        >
            <svg width="34" height="15" viewBox="0 0 36 16" fill="none" className="text-primary">
                <path
                    d="M4 12h2a2 2 0 104 0h8a2 2 0 104 0h5c2 0 3-1 3-3V7c0-1-0.5-2-1.5-2.5L26 3l-4-2H12L8 3 4.5 4.5C3.5 5 3 6 3 7v2c0 2 1 3 1 3z"
                    fill="currentColor"
                    opacity="0.85"
                />
                <circle cx="8" cy="12" r="2" fill="#374151" />
                <circle cx="8" cy="12" r="0.8" fill="#9CA3AF" />
                <circle cx="20" cy="12" r="2" fill="#374151" />
                <circle cx="20" cy="12" r="0.8" fill="#9CA3AF" />
                <path d="M12 4l2.5-1h5L22 4" stroke="white" strokeWidth="0.5" opacity="0.4" />
            </svg>
        </motion.div>
    </div>
);

// ── Animated input with floating label ──
const FloatingInput = ({ id, label, type = "text", value, onChange, isPassword, showPassword, onTogglePassword }) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;
    const isActive = focused || hasValue;

    return (
        <div className="relative">
            {/* Floating label */}
            <motion.label
                htmlFor={id}
                className="absolute left-3.5 pointer-events-none font-medium origin-left z-10"
                animate={{
                    top: isActive ? '6px' : '50%',
                    y: isActive ? 0 : '-50%',
                    fontSize: isActive ? '10px' : '14px',
                    color: focused ? '#3c9e7a' : isActive ? '#6b7280' : '#9ca3af',
                    letterSpacing: isActive ? '0.05em' : '0',
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                {label}
            </motion.label>

            <input
                id={id}
                type={isPassword ? (showPassword ? "text" : "password") : type}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required
                className={`w-full px-3.5 pt-6 pb-2 rounded-xl border text-sm text-gray-900 outline-none bg-white transition-all duration-200 ${
                    focused 
                        ? 'border-primary ring-2 ring-primary/10 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                }`}
                style={isPassword ? { paddingRight: '44px' } : {}}
            />

            {isPassword && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3c9e7a] cursor-pointer transition-colors p-1"
                    aria-label="Toggle password"
                >
                    {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};


// ── Success Celebration Screen ──
const SuccessCelebration = ({ name, isLogin, isReset }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 text-center"
        >
            {/* Animated pulsing circular green checkmark */}
            <div className="relative mb-6">
                <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                >
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        />
                    </svg>
                </motion.div>
            </div>

            {/* Glowing success title */}
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-gray-900 mb-2"
            >
                {isReset ? "Password Reset!" : isLogin ? "Welcome Back!" : "Account Created!"}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-gray-500 max-w-[280px]"
            >
                {isReset ? (
                    <span>Your password has been changed. You can now log in with your new credentials.</span>
                ) : (
                    <span>Hello, <span className="font-semibold text-primary">{name || "Traveler"}</span>. Ready to start your ride today?</span>
                )}
            </motion.p>

            {/* Speeder car animation representing driving off into the app */}
            <div className="w-full relative mt-8 h-10 overflow-hidden">
                <div className="absolute bottom-2 left-0 right-0 h-[1.5px] bg-gray-200/60" />
                <motion.div
                    className="absolute bottom-3"
                    initial={{ x: "-20%" }}
                    animate={{ x: "120%" }}
                    transition={{ duration: 1.2, ease: "easeIn", delay: 0.5 }}
                >
                    <svg width="36" height="16" viewBox="0 0 36 16" fill="none" className="text-primary drop-shadow-[0_0_8px_rgba(60,158,122,0.6)]">
                        <path
                            d="M4 12h2a2 2 0 104 0h8a2 2 0 104 0h5c2 0 3-1 3-3V7c0-1-0.5-2-1.5-2.5L26 3l-4-2H12L8 3 4.5 4.5C3.5 5 3 6 3 7v2c0 2 1 3 1 3z"
                            fill="currentColor"
                        />
                        <circle cx="8" cy="12" r="2" fill="#374151" />
                        <circle cx="20" cy="12" r="2" fill="#374151" />
                    </svg>
                    {/* Glowing trail */}
                    <div className="absolute right-8 top-1 w-12 h-1 bg-gradient-to-l from-primary/60 to-transparent rounded-full" />
                </motion.div>
            </div>
        </motion.div>
    );
};

// ── Account Chooser for Social Logins ──
const AccountChooser = ({ provider, onSelect, onBack }) => {
    const [isCustom, setIsCustom] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customEmail, setCustomEmail] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);

    const accounts = [
        { name: "ENG EBRAHIM", email: "ebrahim@gmail.com", avatar: "EE" },
        { name: "Meshwar Guest", email: "guest@meshwar.com", avatar: "MG" }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (customName.trim() && customEmail.trim()) {
            setSelectedAccount({ name: customName.trim(), email: customEmail.trim() });
        }
    };

    if (selectedAccount) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="text-left mt-2"
            >
                {/* Google or Facebook Header */}
                <div className="flex items-center justify-center gap-2 mb-6 pt-2 select-none">
                    {provider === 'Google' ? (
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 fill-[#1877F2]" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    )}
                    <span className="text-sm font-semibold text-gray-700">Meshwar Authorization</span>
                </div>

                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 mb-6">
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        Meshwar wants to access your {provider} account details:
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                            {selectedAccount.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{selectedAccount.name}</p>
                            <p className="text-xs text-gray-500 truncate">{selectedAccount.email}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 italic leading-normal">
                        By continuing, Meshwar will receive your public profile info and email address. You can cancel this authorization at any time.
                    </p>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(243,244,246,0.8)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedAccount(null)}
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-center bg-white shadow-sm"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -0.5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(selectedAccount.name, selectedAccount.email)}
                        className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer text-center shadow-md"
                    >
                        Continue
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="text-left mt-2"
        >
            <div className="flex items-center gap-2 mb-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-gray-400 hover:text-primary transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h3 className="text-md font-bold text-gray-900">
                    Sign in with {provider}
                </h3>
            </div>

            {!isCustom ? (
                <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2">Choose an account to continue to Meshwar</p>
                    {accounts.map((acc, index) => (
                        <motion.button
                            key={index}
                            type="button"
                            whileHover={{ scale: 1.01, backgroundColor: "rgba(60,158,122,0.04)" }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAccountClick(acc.name, acc.email)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-primary/30 transition-all cursor-pointer text-left shadow-sm"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {acc.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{acc.name}</p>
                                <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                            </div>
                        </motion.button>
                    ))}

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(243,244,246,0.5)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setIsCustom(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 text-xs font-semibold text-gray-500 hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Use another account
                    </motion.button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-xs text-gray-500 mb-2">Enter account details for {provider}</p>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ahmed Ali"
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="e.g. ahmed@example.com"
                            value={customEmail}
                            onChange={e => setCustomEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsCustom(false)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    );
};


const Login = () => {

    const { setShowLogin, axios, setToken, navigate } = useAppContext()

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("user");
    const [isSuccess, setIsSuccess] = useState(false);
    const [successName, setSuccessName] = useState("");
    const [socialProvider, setSocialProvider] = useState(null);

    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [forgotStep, setForgotStep] = useState(1);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.post('/api/user/forgot-password', { email: forgotEmail });
            if (data.success) {
                toast.success(data.message);
                if (data.code) {
                    console.log("Mock OTP Code:", data.code);
                    toast(`Mock OTP Code: ${data.code}`, { icon: '🔑', duration: 6000 });
                }
                setForgotStep(2);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.post('/api/user/reset-password', {
                email: forgotEmail,
                code: otpCode,
                newPassword
            });
            if (data.success) {
                toast.success("Password updated successfully!");
                setSuccessName(forgotEmail.split('@')[0]);
                setIsSuccess(true);
                setTimeout(() => {
                    setIsSuccess(false);
                    setIsForgotPassword(false);
                    setForgotStep(1);
                    setForgotEmail("");
                    setOtpCode("");
                    setNewPassword("");
                }, 2200);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Mouse tilt effect
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [2, -2]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-2, 2]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            setLoading(true);
            const state = isLogin ? "login" : "register";
            const payload = isLogin
                ? { email, password }
                : { name, email, password, phone, role };
            const { data } = await axios.post(`/api/user/${state}`, payload)

            if (data.success) {
                let realName = name;
                try {
                    const userRes = await axios.get('/api/user/data', {
                        headers: { Authorization: data.token }
                    });
                    if (userRes.data.success && userRes.data.user) {
                        realName = userRes.data.user.name;
                    }
                } catch (e) {}

                setSuccessName(realName || "Traveler");
                setIsSuccess(true);

                setTimeout(() => {
                    navigate('/')
                    setToken(data.token)
                    localStorage.setItem('token', data.token)
                    setShowLogin(false)
                }, 2200);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    const executeSocialLogin = async (provider, socialName, socialEmail) => {
        const toastId = toast.loading(`Connecting to ${provider}...`);
        try {
            setLoading(true);
            const socialPassword = "SocialLoginPassword123!";

            let response;
            try {
                const { data } = await axios.post('/api/user/login', { email: socialEmail, password: socialPassword });
                response = data;
            } catch (err) {
                // Ignore error, proceed to register
            }

            if (!response || !response.success) {
                const { data } = await axios.post('/api/user/register', {
                    name: socialName,
                    email: socialEmail,
                    password: socialPassword,
                    phone: "01000000000",
                    role: "user"
                });
                response = data;
            }

            if (response && response.success) {
                let realName = socialName;
                try {
                    const userRes = await axios.get('/api/user/data', {
                        headers: { Authorization: response.token }
                    });
                    if (userRes.data.success && userRes.data.user) {
                        realName = userRes.data.user.name;
                    }
                } catch (e) {}

                toast.success(`Successfully logged in via ${provider}!`, { id: toastId });
                setSuccessName(realName);
                setIsSuccess(true);
                setSocialProvider(null);

                setTimeout(() => {
                    navigate('/');
                    setToken(response.token);
                    localStorage.setItem('token', response.token);
                    setShowLogin(false);
                }, 2200);
            } else {
                toast.error(response?.message || `Failed to authenticate with ${provider}`, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message || `An error occurred during ${provider} login`, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (password.length === 0) return { width: '0%', color: 'transparent', label: '' };
        if (password.length < 4) return { width: '25%', color: '#ef4444', label: 'Weak' };
        if (password.length < 6) return { width: '50%', color: '#f59e0b', label: 'Fair' };
        if (password.length < 8) return { width: '75%', color: '#3b82f6', label: 'Good' };
        return { width: '100%', color: '#3c9e7a', label: 'Strong' };
    };
    const strength = getPasswordStrength();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogin(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(15,23,42,0.4))' }}
        >
            <Particles />

            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformPerspective: 1200,
                }}
                className="w-full max-w-[420px] relative"
            >
                {/* Animated gradient border */}
                <div
                    className="absolute -inset-[1px] rounded-2xl opacity-60"
                    style={{
                        background: 'linear-gradient(135deg, #3c9e7a, #34d399, #3c9e7a, #34d399)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 4s ease infinite',
                    }}
                />

                {/* Card */}
                <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(60,158,122,0.08),_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden">

                    {/* Top accent line */}
                    <motion.div
                        className="h-[3px] w-full"
                        style={{
                            background: 'linear-gradient(90deg, #3c9e7a, #34d399, #10b981, #3c9e7a)',
                            backgroundSize: '200% 100%',
                        }}
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="px-8 pt-6 pb-8">
                        <AnimatePresence mode="wait">
                            {!isSuccess ? (
                                <motion.div
                                    key="auth-flow"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {/* Header row */}
                                    <div className="flex items-center justify-between mb-4">
                                        <img src={assets.logo} alt="Meshwar" className="h-8 object-contain" />
                                        <motion.button
                                            whileHover={{ rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowLogin(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                            aria-label="Close"
                                        >
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.button>
                                    </div>

                                    {/* Road animation */}
                                    <RoadAnimation />

                                    <AnimatePresence mode="wait">
                                        {isForgotPassword ? (
                                            <motion.div
                                                key="forgot-password-flow"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="text-left"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsForgotPassword(false)}
                                                        className="text-gray-400 hover:text-primary transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                                        </svg>
                                                    </button>
                                                    <h3 className="text-md font-bold text-gray-900">
                                                        Reset Password
                                                    </h3>
                                                </div>

                                                {forgotStep === 1 ? (
                                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            Enter your email address to receive a 6-digit verification code.
                                                        </p>
                                                        <FloatingInput
                                                            id="forgot-email"
                                                            label="Email Address"
                                                            type="email"
                                                            value={forgotEmail}
                                                            onChange={e => setForgotEmail(e.target.value)}
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            disabled={loading}
                                                            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 transition-all"
                                                        >
                                                            {loading ? "Please wait..." : "Send Verification Code"}
                                                        </motion.button>
                                                    </form>
                                                ) : (
                                                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            We've sent a 6-digit verification code to <span className="font-semibold text-primary">{forgotEmail}</span>.
                                                        </p>
                                                        <FloatingInput
                                                            id="otp-code"
                                                            label="6-Digit Code"
                                                            type="text"
                                                            value={otpCode}
                                                            onChange={e => setOtpCode(e.target.value)}
                                                        />
                                                        <FloatingInput
                                                            id="new-password"
                                                            label="New Password"
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={e => setNewPassword(e.target.value)}
                                                            isPassword
                                                            showPassword={showPassword}
                                                            onTogglePassword={() => setShowPassword(!showPassword)}
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            disabled={loading}
                                                            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 transition-all"
                                                        >
                                                            {loading ? "Please wait..." : "Reset Password"}
                                                        </motion.button>
                                                    </form>
                                                )}
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotPassword(false)}
                                                    className="w-full text-center text-xs font-semibold text-primary hover:underline cursor-pointer mt-4"
                                                >
                                                    Back to Sign in
                                                </button>
                                            </motion.div>
                                        ) : socialProvider ? (
                                            <AccountChooser
                                                key="social-chooser"
                                                provider={socialProvider}
                                                onSelect={(name, email) => executeSocialLogin(socialProvider, name, email)}
                                                onBack={() => setSocialProvider(null)}
                                            />
                                        ) : (
                                            <motion.div
                                                key="standard-auth"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {/* Title */}
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={isLogin ? "login-title" : "reg-title"}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="mb-5"
                                                    >
                                                        <h2 className="text-xl font-semibold text-gray-900">
                                                            {isLogin ? "Welcome back" : "Create account"}
                                                        </h2>
                                                        <p className="text-sm text-gray-500 mt-0.5">
                                                            {isLogin
                                                                ? "Sign in to access your bookings and trips."
                                                                : "Join Meshwar and start your next adventure."}
                                                        </p>
                                                    </motion.div>
                                                </AnimatePresence>

                                                {/* Pill toggle */}
                                                <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
                                                    <motion.div
                                                        className="absolute top-1 bottom-1 rounded-md bg-white shadow-sm"
                                                        animate={{ left: isLogin ? '4px' : 'calc(50% + 0px)', width: 'calc(50% - 4px)' }}
                                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                    />
                                                    <button
                                                        onClick={() => setIsLogin(true)}
                                                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Sign in
                                                    </button>
                                                    <button
                                                        onClick={() => setIsLogin(false)}
                                                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${!isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Sign up
                                                    </button>
                                                </div>

                                                {/* Form */}
                                                <AnimatePresence mode="wait">
                                                    <motion.form
                                                        key={isLogin ? "login" : "register"}
                                                        initial={{ opacity: 0, x: isLogin ? -12 : 12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: isLogin ? 12 : -12 }}
                                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                                        onSubmit={onSubmitHandler}
                                                        className="space-y-4"
                                                    >
                                                        {/* Name (register) */}
                                                        {/* Register-only fields */}
                                                        {!isLogin && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25 }}
                                                                className="space-y-4 overflow-visible"
                                                            >
                                                                <FloatingInput
                                                                    id="auth-name"
                                                                    label="Full Name"
                                                                    value={name}
                                                                    onChange={e => setName(e.target.value)}
                                                                />
                                                                <FloatingInput
                                                                    id="auth-phone"
                                                                    label="Phone Number"
                                                                    type="tel"
                                                                    value={phone}
                                                                    onChange={e => setPhone(e.target.value)}
                                                                />
                                                                <div className="space-y-2">
                                                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block text-left">
                                                                        I want to join as a:
                                                                    </span>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <motion.button
                                                                            type="button"
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => setRole("user")}
                                                                            className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${role === "user" ? 'border-primary bg-primary/[0.04] text-primary shadow-sm shadow-primary/5 font-semibold' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-500 font-medium'}`}
                                                                        >
                                                                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                            </svg>
                                                                            <span className="text-xs">Renter</span>
                                                                        </motion.button>
                                                                        <motion.button
                                                                            type="button"
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => setRole("owner")}
                                                                            className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${role === "owner" ? 'border-primary bg-primary/[0.04] text-primary shadow-sm shadow-primary/5 font-semibold' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-500 font-medium'}`}
                                                                        >
                                                                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                            </svg>
                                                                            <span className="text-xs">Car Owner</span>
                                                                        </motion.button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        <FloatingInput
                                                            id="auth-email"
                                                            label="Email Address"
                                                            type="email"
                                                            value={email}
                                                            onChange={e => setEmail(e.target.value)}
                                                        />

                                                        <div>
                                                            <FloatingInput
                                                                id="auth-password"
                                                                label="Password"
                                                                value={password}
                                                                onChange={e => setPassword(e.target.value)}
                                                                isPassword
                                                                showPassword={showPassword}
                                                                onTogglePassword={() => setShowPassword(!showPassword)}
                                                            />
                                                            {isLogin && (
                                                                <div className="flex justify-end mt-1.5 select-none">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setIsForgotPassword(true);
                                                                            setForgotStep(1);
                                                                        }}
                                                                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                                                                    >
                                                                        Forgot Password?
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {/* Password strength bar */}
                                                            {!isLogin && password.length > 0 && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className="mt-2 flex items-center gap-2"
                                                                >
                                                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            className="h-full rounded-full"
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: strength.width, backgroundColor: strength.color }}
                                                                            transition={{ duration: 0.3 }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[11px] font-medium" style={{ color: strength.color }}>
                                                                        {strength.label}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                        </div>

                                                        {/* Submit */}
                                                        <motion.button
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            disabled={loading}
                                                            className="relative w-full py-3 mt-1 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20"
                                                        >
                                                            {/* Hover shimmer */}
                                                            <motion.div
                                                                className="absolute inset-0 pointer-events-none"
                                                                style={{
                                                                    background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                                                                    backgroundSize: '200% 100%',
                                                                }}
                                                                animate={{ backgroundPosition: ['100% 0', '-100% 0'] }}
                                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                                            />
                                                            <span className="relative flex items-center justify-center gap-2">
                                                                {loading ? (
                                                                    <>
                                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                        </svg>
                                                                        Please wait…
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {isLogin ? "Sign in" : "Create account"}
                                                                        <motion.svg
                                                                            className="w-4.5 h-4.5"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                            strokeWidth={2.5}
                                                                            animate={{ x: [0, 3, 0] }}
                                                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                                        </motion.svg>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </motion.button>

                                                        {/* Divider */}
                                                        <div className="relative my-4 flex items-center justify-center">
                                                            <div className="absolute inset-0 flex items-center">
                                                                <div className="w-full border-t border-gray-100"></div>
                                                            </div>
                                                            <span className="relative bg-white px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                                                                or continue with
                                                            </span>
                                                        </div>

                                                        {/* Social Login Buttons */}
                                                        <div className="flex gap-3">
                                                            <motion.button
                                                                type="button"
                                                                whileHover={{ scale: 1.02, y: -1 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setSocialProvider('Google')}
                                                                className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 cursor-pointer shadow-sm hover:shadow-md"
                                                            >
                                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                                                </svg>
                                                                <span>Google</span>
                                                            </motion.button>

                                                            <motion.button
                                                                type="button"
                                                                whileHover={{ scale: 1.02, y: -1 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setSocialProvider('Facebook')}
                                                                className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 cursor-pointer shadow-sm hover:shadow-md"
                                                            >
                                                                <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                                </svg>
                                                                <span>Facebook</span>
                                                            </motion.button>
                                                        </div>
                                                    </motion.form>
                                                </AnimatePresence>

                                                {/* Footer */}
                                                <p className="text-center text-sm text-gray-400 mt-6">
                                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                                    <button
                                                        onClick={() => setIsLogin(!isLogin)}
                                                        className="text-primary font-semibold hover:underline cursor-pointer"
                                                    >
                                                        {isLogin ? "Sign up" : "Sign in"}
                                                    </button>
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <SuccessCelebration name={successName} isLogin={isLogin} isReset={isForgotPassword} />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* CSS for gradient animation */}
            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </motion.div>
    )
}

export default Login
