import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets, dummyCarData } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Cars = () => {

  // getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')
  const searchQuery = searchParams.get('search')

  const { cars, axios, currency } = useAppContext()

  const isSearchData = pickupLocation && pickupDate && returnDate

  const [input, setInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Permanent Filter State
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTransmission, setSelectedTransmission] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [maxPrice, setMaxPrice] = useState(20000)

  // Local Filter State (Unapplied)
  const [localCategory, setLocalCategory] = useState('All')
  const [localTransmission, setLocalTransmission] = useState('All')
  const [localLocation, setLocalLocation] = useState('All')
  const [localMaxPrice, setLocalMaxPrice] = useState(20000)

  const [baseCars, setBaseCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])

  // Get unique locations for the dropdown
  const uniqueLocations = Array.isArray(cars) ? [...new Set(cars.map(car => car.location))].filter(Boolean).sort() : []

  const applyFilter = async () => {

    // Always start from the base set (either all cars or search results)
    let tempCars = baseCars.length > 0 ? baseCars.slice() : cars.slice()

    // Filter by search input (Real-time text search)
    if (input !== '') {
      tempCars = tempCars.filter((car) => {
        return car.brand.toLowerCase().includes(input.toLowerCase())
          || car.model.toLowerCase().includes(input.toLowerCase())
          || car.category.toLowerCase().includes(input.toLowerCase())
          || car.transmission.toLowerCase().includes(input.toLowerCase())
      })
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      tempCars = tempCars.filter(car => car.category === selectedCategory)
    }

    // Filter by transmission
    if (selectedTransmission !== 'All') {
      tempCars = tempCars.filter(car => car.transmission === selectedTransmission)
    }

    // Filter by location
    if (selectedLocation !== 'All') {
      tempCars = tempCars.filter(car => car.location === selectedLocation)
    }

    // Filter by price
    tempCars = tempCars.filter(car => car.pricePerDay <= maxPrice)

    setFilteredCars(tempCars)
  }

  const handleApplyFilters = () => {
    setSelectedCategory(localCategory)
    setSelectedTransmission(localTransmission)
    setSelectedLocation(localLocation)
    setMaxPrice(localMaxPrice)
    setShowFilters(false)
  }

  const handleResetFilters = () => {
    setLocalCategory('All')
    setLocalTransmission('All')
    setLocalLocation('All')
    setLocalMaxPrice(20000)
    setSelectedCategory('All')
    setSelectedTransmission('All')
    setSelectedLocation('All')
    setMaxPrice(20000)
    setBaseCars(cars) // Revert to full list
  }

  const searchCarAvailablity = async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', { location: pickupLocation, pickupDate, returnDate })
      if (data.success) {
        setBaseCars(data.availableCars)
        if (data.availableCars.length === 0) {
          toast('No cars available for these dates. Showing all cars instead.')
          setBaseCars(cars)
        }
      }
    } catch (error) {
      setBaseCars(cars)
    }
  }

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailablity()
    } else if (cars.length > 0) {
      setBaseCars(cars)
    }
  }, [cars, isSearchData])

  useEffect(() => {
    if (searchQuery) {
      setInput(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (cars.length > 0) {
      applyFilter()
    }
  }, [input, selectedCategory, selectedTransmission, selectedLocation, maxPrice, baseCars]);

  return (
    <div className='min-h-screen pb-20'>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}

        className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title='Available Cars' subTitle='Browse our selection of premium vehicles available for your next adventure' />

        <div className='relative max-w-140 w-full mt-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}

            className='flex items-center bg-white px-4 w-full h-12 rounded-full shadow'>
            <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2' />

            <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full outline-none text-gray-500' />

            <div onClick={() => setShowFilters(!showFilters)} className='flex items-center gap-1 cursor-pointer group'>
              <img src={assets.filter_icon} alt="" className={`w-4.5 h-4.5 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              <span className='text-xs font-bold text-gray-400 group-hover:text-primary transition-colors pr-2'>Filters</span>
            </div>
          </motion.div>

          {/* Filter Dropdown */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='absolute top-14 left-0 right-0 glass z-50 p-6 rounded-2xl shadow-xl border border-gray-200'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {/* Category Filter */}
                <div>
                  <p className='text-sm font-bold text-gray-700 mb-2'>Category</p>
                  <select
                    value={localCategory}
                    onChange={(e) => setLocalCategory(e.target.value)}
                    className='w-full p-2.5 rounded-xl bg-white border border-gray-200 text-sm outline-none shadow-sm'
                  >
                    <option value="All">All Categories</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Van">Van</option>
                  </select>
                </div>

                {/* Transmission Filter */}
                <div>
                  <p className='text-sm font-bold text-gray-700 mb-2'>Transmission</p>
                  <select
                    value={localTransmission}
                    onChange={(e) => setLocalTransmission(e.target.value)}
                    className='w-full p-2.5 rounded-xl bg-white border border-gray-200 text-sm outline-none shadow-sm'
                  >
                    <option value="All">All Types</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <p className='text-sm font-bold text-gray-700 mb-2'>Location</p>
                  <select
                    value={localLocation}
                    onChange={(e) => setLocalLocation(e.target.value)}
                    className='w-full p-2.5 rounded-xl bg-white border border-gray-200 text-sm outline-none shadow-sm'
                  >
                    <option value="All">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <p className='text-sm font-bold text-gray-700'>Max Price/Day</p>
                    <p className='text-sm font-black text-primary'>{localMaxPrice.toLocaleString()} {currency}</p>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="20000"
                    step="100"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className='w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
              </div>

              <div className='flex justify-between items-center mt-6 pt-4 border-t border-gray-100'>
                <button
                  onClick={handleResetFilters}
                  className='text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider'
                >
                  Clear All
                </button>
                <div className='flex gap-3'>
                  <button
                    onClick={() => setShowFilters(false)}
                    className='px-5 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-all'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className='px-8 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dull rounded-full shadow-md shadow-primary/20 transition-all active:scale-95'
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

        className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index) => (
            <motion.div key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}

export default Cars
