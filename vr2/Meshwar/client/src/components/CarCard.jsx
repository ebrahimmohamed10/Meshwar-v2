import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'

const CarCard = ({ car }) => {

    const { currency } = useAppContext()
    const navigate = useNavigate()
    const unavailable = !car.isAvaliable

    return (
        <motion.div
            whileHover={{ y: unavailable ? 0 : -6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => { navigate(`/car-details/${car._id}`); scrollTo(0, 0) }}
            className={`group bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-400 cursor-pointer border border-gray-100
                ${unavailable ? 'opacity-75 grayscale-[35%] hover:shadow-md' : 'hover:shadow-2xl hover:shadow-primary/10'}`}
        >
            {/* Image */}
            <div className='relative h-52 overflow-hidden bg-gray-50'>
                <img
                    src={car.image}
                    alt="Car Image"
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-108'
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Availability badge */}
                {unavailable ? (
                    <span className='absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Unavailable
                    </span>
                ) : (
                    <span className='absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg'>
                        ✓ Available
                    </span>
                )}

                {/* Category badge */}
                <span className='absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full'>
                    {car.category}
                </span>

                {/* Price */}
                <div className='absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg'>
                    <span className='font-bold text-gray-900 text-sm'>{car.pricePerDay.toLocaleString()} {currency}</span>
                    <span className='text-gray-400 text-xs'> /day</span>
                </div>
            </div>

            {/* Content */}
            <div className='p-5'>
                <div className='flex justify-between items-start mb-3'>
                    <div>
                        <h3 className='text-lg font-bold text-gray-900 group-hover:text-primary transition-colors'>
                            {car.brand} {car.model}
                        </h3>
                        <p className='text-gray-400 text-sm mt-0.5'>{car.year}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-3" />

                {/* Specs grid */}
                <div className='grid grid-cols-2 gap-2.5'>
                    <div className='flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                        <img src={assets.users_icon} alt="" className='h-3.5 opacity-60' />
                        <span className="font-medium">{car.seating_capacity} Seats</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                        <img src={assets.fuel_icon} alt="" className='h-3.5 opacity-60' />
                        <span className="font-medium">{car.fuel_type}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                        <img src={assets.car_icon} alt="" className='h-3.5 opacity-60' />
                        <span className="font-medium">{car.transmission}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                        <img src={assets.location_icon} alt="" className='h-3.5 opacity-60' />
                        <span className="font-medium truncate">{car.location}</span>
                    </div>
                </div>

                {/* CTA */}
                <div className={`mt-4 w-full py-2.5 text-center text-sm font-semibold rounded-xl transition-all duration-300
                    ${unavailable
                        ? 'bg-red-50 text-red-400 border border-red-200'
                        : 'text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white group-hover:border-primary'
                    }`}>
                    {unavailable ? '⊘ Not Available for Booking' : 'View Details →'}
                </div>
            </div>
        </motion.div>
    )
}

export default CarCard
