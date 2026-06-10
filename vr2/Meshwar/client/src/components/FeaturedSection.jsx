import React from 'react'
import Title from './Title'
import { assets } from '../assets/assets'
import CarCard from './CarCard'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const FeaturedSection = () => {

    const navigate = useNavigate()
    const { cars } = useAppContext()

    return (
        <section className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32 bg-white relative overflow-hidden'>

            {/* Subtle bg decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute -top-20 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <Title title='Featured Vehicles' subTitle='Explore our selection of premium vehicles available for your next adventure.' />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                viewport={{ once: true }}
                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-14 w-full'
            >
                {cars.slice(0, 6).map((car, i) => (
                    <motion.div
                        key={car._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
                        viewport={{ once: true }}
                    >
                        <CarCard car={car} />
                    </motion.div>
                ))}
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                viewport={{ once: true }}
                onClick={() => { navigate('/cars'); scrollTo(0, 0) }}
                className='flex items-center justify-center gap-2.5 px-8 py-3 mt-14 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer group'
            >
                Explore all cars
                <img src={assets.arrow_icon} alt="arrow" className="group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
        </section>
    )
}

export default FeaturedSection
