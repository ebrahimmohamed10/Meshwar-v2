import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const Hero = () => {

    const [pickupLocation, setPickupLocation] = useState('')
    const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext()

    const handleSearch = (e) => {
        e.preventDefault()
        navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate)
    }

    const stats = [
        { value: '500+', label: 'Vehicles' },
        { value: '50K+', label: 'Happy Clients' },
        { value: '20+', label: 'Cities' },
    ]

    return (
        <div className='relative min-h-screen flex flex-col items-center justify-center hero-bg overflow-hidden pt-20'>

            {/* Decorative background orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-3xl pointer-events-none" />

<div className="relative z-20 flex flex-col items-center text-center gap-6 px-4 w-full max-w-5xl">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-1.5 rounded-full"
                >
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Egypt's #1 Car Rental Platform
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className='text-5xl md:text-7xl font-bold leading-tight tracking-tight text-gray-900'
                >
                    Drive Your <br />
                    <span className="gradient-text">Dream Car</span> Today
                </motion.h1>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="text-gray-500 text-lg max-w-lg"
                >
                    Premium vehicles, unbeatable prices. Book your perfect ride in minutes across Egypt.
                </motion.p>

                {/* Search form */}
                <motion.form
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    onSubmit={handleSearch}
                    className='w-full max-w-3xl bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-3 mt-2'
                >
                    <div className='flex flex-col md:flex-row gap-2'>
                        {/* Location */}
                        <div className='flex-1 flex flex-col items-start gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors'>
                            <label className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>📍 Location</label>
                            <select
                                required
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                className='w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer'
                            >
                                <option value="">Select city</option>
                                {cityList.map((city) => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>

                        <div className="hidden md:block w-px bg-gray-200 my-2" />

                        {/* Pick-up date */}
                        <div className='flex-1 flex flex-col items-start gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors'>
                            <label htmlFor='pickup-date' className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>📅 Pick-up</label>
                            <input
                                value={pickupDate}
                                onChange={e => setPickupDate(e.target.value)}
                                type="date"
                                id="pickup-date"
                                min={(() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    const yyyy = tomorrow.getFullYear();
                                    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
                                    const dd = String(tomorrow.getDate()).padStart(2, '0');
                                    return `${yyyy}-${mm}-${dd}`;
                                })()}
                                className='w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer'
                                required
                            />
                        </div>

                        <div className="hidden md:block w-px bg-gray-200 my-2" />

                        {/* Return date */}
                        <div className='flex-1 flex flex-col items-start gap-1 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors'>
                            <label htmlFor='return-date' className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>🔄 Return</label>
                            <input
                                value={returnDate}
                                onChange={e => setReturnDate(e.target.value)}
                                type="date"
                                id="return-date"
                                min={(() => {
                                    if (pickupDate) {
                                        const nextDay = new Date(pickupDate);
                                        nextDay.setDate(nextDay.getDate() + 1);
                                        return nextDay.toISOString().split('T')[0];
                                    }
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 2);
                                    const yyyy = tomorrow.getFullYear();
                                    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
                                    const dd = String(tomorrow.getDate()).padStart(2, '0');
                                    return `${yyyy}-${mm}-${dd}`;
                                })()}
                                className='w-full bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer'
                                required
                            />
                        </div>

                        {/* Search button */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className='flex items-center justify-center gap-2 px-7 py-3.5 btn-primary font-semibold rounded-xl cursor-pointer shrink-0'
                        >
                            <img src={assets.search_icon} alt="search" className='brightness-300 w-4 h-4' />
                            Search
                        </motion.button>
                    </div>
                </motion.form>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex items-center gap-8 mt-2"
                >
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Car image */}
            {/* Car image */}
{/* Car image */}
{/* Car image */}
            <motion.div className="w-full max-w-[1600px] mx-auto flex justify-center mt-2 md:-mt-10 lg:-mt-16 xl:-mt-24 2xl:-mt-32">
                <motion.img
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    src={assets.main_car}
                    alt="car"
                    className='relative z-10 w-[95%] md:w-[950px] lg:w-[1150px] xl:w-[1350px] 2xl:w-[1550px] h-auto object-contain float-anim drop-shadow-2xl'
                />
            </motion.div>
        </div>
    )
}

export default Hero
