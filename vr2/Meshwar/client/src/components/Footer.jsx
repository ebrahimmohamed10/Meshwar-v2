import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Footer = () => {
    const navigate = useNavigate()
    const { user, setShowLogin, isPremium } = useAppContext()

    const handleListCars = (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login or create an account to list your car');
            setShowLogin(true);
            return;
        }
        isPremium ? navigate('/owner') : navigate('/checkout/premium');
    };

    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'Browse Cars', href: '/cars' },
        { label: 'List Your Car', href: '/owner' },
        { label: 'My Bookings', href: '/my-bookings' },
    ]

    const resourceLinks = [
        { label: 'Help Center', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Insurance', href: '#' },
    ]

    const socials = [
        { icon: assets.facebook_logo, label: 'Facebook' },
        { icon: assets.instagram_logo, label: 'Instagram' },
        { icon: assets.twitter_logo, label: 'Twitter' },
        { icon: assets.gmail_logo, label: 'Email' },
    ]

    return (
        <motion.footer
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='relative text-gray-300 overflow-hidden' style={{ backgroundColor: '#1a4a32' }}
        >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className='px-6 md:px-16 lg:px-24 xl:px-32 pt-16 pb-8'>

                {/* Main grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10 border-primary/20'>

                    {/* Brand column */}
                    <div className='lg:col-span-1'>
                        <motion.img
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            src={assets.logo}
                            alt="logo"
                            className='h-9 mb-4'
                        />
                        <p className='text-sm leading-relaxed text-green-200/70 max-w-56 mb-6'>
                            Premium car rental service with a wide selection of luxury and everyday vehicles for all your driving needs.
                        </p>
                        {/* Social icons */}
                        <div className='flex items-center gap-3'>
                            {socials.map((s, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 bg-white/8 hover:bg-primary/30 border border-white/15 hover:border-primary/50 rounded-lg flex items-center justify-center transition-all duration-200"
                                    aria-label={s.label}
                                >
                                    <img src={s.icon} className='w-4 h-4 brightness-200 opacity-70 hover:opacity-100 transition-opacity' alt={s.label} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className='text-sm font-bold text-green-100 uppercase tracking-widest mb-5'>Quick Links</h3>
                        <ul className='flex flex-col gap-3'>
                            {quickLinks.map((l, i) => (
                                <li key={i}>
                                    <Link
                                        to={l.href}
                                        onClick={l.label === 'List Your Car' ? handleListCars : undefined}
                                        className='text-sm text-gray-500 hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group'
                                    >
                                        <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className='text-sm font-bold text-green-100 uppercase tracking-widest mb-5'>Resources</h3>
                        <ul className='flex flex-col gap-3'>
                            {resourceLinks.map((l, i) => (
                                <li key={i}>
                                    <a
                                        href={l.href}
                                        className='text-sm text-gray-500 hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group'
                                    >
                                        <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className='text-sm font-bold text-green-100 uppercase tracking-widest mb-5'>Contact</h3>
                        <ul className='flex flex-col gap-3 text-sm text-green-200/70'>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">📍</span>
                                <span>Mansoura, Ahmed Maher Street, 319</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary">📞</span>
                                <a href="tel:+201012345678" className="hover:text-primary transition-colors">+20 1012345678</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary">✉️</span>
                                <a href="mailto:Meshwar_300@gmail.com" className="hover:text-primary transition-colors">Meshwar_300@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className='flex flex-col md:flex-row items-center justify-between gap-3 pt-7 text-xs text-green-200/50'>
                    <p>© {new Date().getFullYear()} <span className='text-primary font-medium'>Meshwar</span>. All rights reserved.</p>
                    <ul className='flex items-center gap-5'>
                        {['Privacy', 'Terms', 'Cookies'].map((item, i) => (
                            <li key={i}>
                                <a href="#" className="hover:text-primary transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.footer>
    )
}

export default Footer
