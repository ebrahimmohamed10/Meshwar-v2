import React, { useState, useEffect } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

const Navbar = () => {

    const { setShowLogin, user, logout, isOwner, axios, setIsOwner, currency, isPremium } = useAppContext()
    const location = useLocation()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) navigate(`/cars?search=${searchTerm}`)
    }

    const changeRole = async () => {
        try {
            const { data } = await axios.post('/api/owner/change-role')
            if (data.success) { setIsOwner(true); toast.success(data.message) }
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) }
    }

    const handleListCars = () => {
        if (!user) {
            toast.error('Please login or create an account to list your car');
            setShowLogin(true);
            return;
        }
        isPremium ? navigate('/owner') : navigate('/checkout/premium');
    };

    const isHome = location.pathname === '/'

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-3 transition-all duration-400 ${scrolled
                ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100'
                : isHome
                    ? 'bg-transparent'
                    : 'bg-white/80 backdrop-blur-md border-b border-borderColor'
                }`}
        >
            {/* Logo */}
            <Link to='/' onClick={() => setOpen(false)}>
                <motion.img
                    whileHover={{ scale: 1.04 }}
                    src={assets.logo}
                    alt="logo"
                    className="h-9 md:h-11 w-auto object-contain"
                />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-8">
                {menuLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Link
                            to={link.path}
                            className={`text-sm font-medium relative group transition-colors duration-200 ${location.pathname === link.path
                                ? 'text-primary'
                                : 'text-gray-600 hover:text-primary'
                                }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                                }`} />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Search + actions */}
            <div className="hidden lg:flex items-center gap-4">
                {/* Search bar */}
                <div className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-full w-48">
                    <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-50 cursor-pointer"
                        onClick={() => searchTerm.trim() && navigate(`/cars?search=${searchTerm}`)} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        className="bg-transparent outline-none w-full placeholder-gray-400 text-gray-600 text-sm"
                        placeholder="Search cars…"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleListCars}
                    className="relative overflow-hidden group flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-emerald-50 to-teal-50 text-primary border border-primary/20 px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                        <span className="w-2 h-2 bg-primary group-hover:bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.8)] group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
                        {isPremium ? 'Owner Dashboard' : 'List your car'}
                        {!isPremium && (
                            <span className="flex items-center gap-0.5 bg-emerald-100 text-primary border border-emerald-200 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 transition-colors">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                PREMIUM
                            </span>
                        )}
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { user ? logout() : setShowLogin(true) }}
                    className="btn-primary text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer shadow-md"
                >
                    {user ? 'Logout' : 'Login'}
                </motion.button>
            </div>

            {/* Mobile hamburger */}
            <button className='sm:hidden cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors' aria-label="Menu" onClick={() => setOpen(!open)}>
                <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" className="w-5 h-5" />
            </button>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl sm:hidden px-6 py-6 flex flex-col gap-4"
                    >
                        {menuLinks.map((link, i) => (
                            <div key={i} className="flex items-center justify-between py-1">
                                <Link to={link.path} onClick={() => setOpen(false)}
                                    className="text-gray-700 font-medium hover:text-primary transition-colors">
                                    {link.name}
                                </Link>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full">
                            <img src={assets.search_icon} alt="" className="w-4 h-4 opacity-50" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch} className="bg-transparent outline-none w-full text-sm placeholder-gray-400"
                                placeholder="Search cars…" />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button onClick={() => { handleListCars(); setOpen(false) }}
                                className="flex-1 text-center py-2.5 rounded-full border border-primary bg-primary/5 text-sm font-bold text-primary hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)] transition-all duration-300 cursor-pointer relative overflow-hidden group">
                                <span className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                                    <span className="w-1.5 h-1.5 bg-primary group-hover:bg-white rounded-full animate-pulse" />
                                    {isPremium ? 'Owner Dashboard' : 'List your car'}
                                    {!isPremium && (
                                        <span className="flex items-center gap-0.5 bg-emerald-100 text-primary border border-emerald-200 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 transition-colors">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            PREMIUM
                                        </span>
                                    )}
                                </span>
                            </button>
                            <button onClick={() => { user ? logout() : setShowLogin(true); setOpen(false) }}
                                className="flex-1 btn-primary text-sm font-semibold py-2.5 rounded-full cursor-pointer">
                                {user ? 'Logout' : 'Login'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

export default Navbar
