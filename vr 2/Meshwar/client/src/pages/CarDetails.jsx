  import React, { useEffect, useState } from 'react'
  import { useNavigate, useParams } from 'react-router-dom'
  import { assets, dummyCarData } from '../assets/assets'
  import Loader from '../components/Loader'
  import { useAppContext } from '../context/AppContext'
  import toast from 'react-hot-toast'
  import { motion } from 'motion/react'
  import DatePicker from "react-datepicker"
  import "react-datepicker/dist/react-datepicker.css"

  const CarDetails = () => {
    const { id } = useParams()
    const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, user: userData } = useAppContext()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [calculatedPrice, setCalculatedPrice] = useState(null)
    const [isCalculating, setIsCalculating] = useState(false)
    
    const [bookedDates, setBookedDates] = useState([]) 
    const [showOwnerModal, setShowOwnerModal] = useState(false)
    const currency = import.meta.env.VITE_CURRENCY
    console.log("User Data from Context:", userData);

    

  const handleSubmit = async (e) => {
      e.preventDefault();


      if (!userData) {
        toast.error('Please login to book a car.');
        return;
      }

    
      const requiredFields = [
        { key: 'phone', label: 'Phone Number' },
        { key: 'idNumber', label: 'National ID' },       
        { key: 'licenseNumber', label: 'Driving License' }, 
        { key: 'job', label: 'Job Title' },              
        { key: 'nationality', label: 'Nationality' },
        { key: 'gender', label: 'Gender' }
      ];


      const missingFields = requiredFields
        .filter(field => !userData[field.key] || userData[field.key] === 'Not Selected')
        .map(field => field.label);

      const missingDocs = [];
      if (!userData.idCardFront) missingDocs.push('ID Card (Front)');
      if (!userData.idCardBack) missingDocs.push('ID Card (Back)');
      if (!userData.licenseFront) missingDocs.push('License (Front)');
      if (!userData.licenseBack) missingDocs.push('License (Back)');

      if (missingFields.length > 0 || missingDocs.length > 0) {
        let errorMsg = '';
        if (missingFields.length > 0) {
          errorMsg += `Missing fields: ${missingFields.join(', ')}. `;
        }
        if (missingDocs.length > 0) {
          errorMsg += `Missing documents: ${missingDocs.join(', ')}.`;
        }
        toast.error(`Please complete your profile. ${errorMsg}`, { duration: 4000 });
        
        setTimeout(() => {
          navigate('/my-account');
        }, 2000);
        
        return;
      }

      if (userData.verificationStatus !== 'verified') {
        if (userData.verificationStatus === 'pending') {
          toast.error('Your verification is currently in progress. Please wait for the AI review to complete.', { duration: 5000 });
        } else if (userData.verificationStatus === 'rejected') {
          toast.error(`Your identity verification was rejected: ${userData.verificationError || 'Invalid details'}. Please update your details/documents under 'My Account'.`, { duration: 5000 });
        } else {
          toast.error('Please complete identity verification under "My Account" before booking.', { duration: 5000 });
        }
        
        setTimeout(() => {
          navigate('/my-account');
        }, 2000);
        
        return;
      }

    

      if (!car?.isAvaliable) {
        toast.error('This car is currently unavailable for booking.');
        return;
      }
      
      if (!pickupDate || !returnDate) {
        toast.error('Please select both pickup and return dates.');
        return;
      }
      
      navigate(`/checkout/${id}`);
    }
  useEffect(() => {
    setCar(cars.find(car => car._id === id))

      const fetchBookedDates = async () => {
        try {
          const { data } = await axios.get(`/api/bookings/car-dates/${id}`);
          if (data.success && data.bookedDates) {
            const datesToExclude = data.bookedDates.map(dateStr => new Date(dateStr));
            setBookedDates(datesToExclude);
          }
        } catch (error) {
          console.error("Error fetching booked dates:", error);
        }
      };

if (id) {
      fetchBookedDates();
    }

    if (cars.length > 0 && id) {
      const currentCar = cars.find(c => c._id === id);
      if (currentCar) {
        let recentCars = JSON.parse(localStorage.getItem('recentlyViewedCars')) || [];
        recentCars = recentCars.filter(c => c._id !== currentCar._id);
       recentCars.unshift({
          _id: currentCar._id,
          brand: currentCar.brand,
          model: currentCar.model,
          image: currentCar.image,
          pricePerDay: currentCar.pricePerDay,
          year: currentCar.year,
          category: currentCar.category,
          seating_capacity: currentCar.seating_capacity,
          fuel_type: currentCar.fuel_type,
          transmission: currentCar.transmission,
          location: currentCar.location
        });
        if (recentCars.length > 12) {
          recentCars = recentCars.slice(0, 12);
        }
        localStorage.setItem('recentlyViewedCars', JSON.stringify(recentCars));
      }
    }
    }, [cars, id, axios])

    useEffect(() => {
      const fetchPrice = async () => {
        if (car && pickupDate && returnDate) {
          setIsCalculating(true);
          try {
            const { data } = await axios.post('/api/pricing/calculate', {
              carId: id,
              pickupDate,
              returnDate
            });
            if (data.success) {
              setCalculatedPrice(data.pricing);
            }
          } catch (error) {
            console.error("Error calculating price:", error);
          } finally {
            setIsCalculating(false);
          }
        } else {
          setCalculatedPrice(null);
        }
      };

      fetchPrice();
    }, [car, pickupDate, returnDate, id, axios]);

    return car ? (
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

        <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
          <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
          Back to all cars
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
          {/* Left: Car Image & Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='lg:col-span-2'>
            
            <motion.img
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />

              <motion.div className='space-y-6'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                  <div>
                    <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
                    <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
                  </div>

                  {/* Owner Info Card */}
                  {car.ownerDetails && (
                    <div
                      className='p-3 pr-5 bg-white border border-gray-200 shadow-sm rounded-2xl inline-flex items-center gap-8 cursor-pointer hover:shadow-md transition-all group w-fit'
                      onClick={() => setShowOwnerModal(true)}
                    >
                      <div className='flex items-center gap-4'>
                        <div className='relative'>
                          <img src={car.ownerDetails.image || assets.profile_icon} alt="Owner" className='w-12 h-12 rounded-full object-cover shadow-sm border-2 border-gray-100 group-hover:border-primary transition-colors' />
                          <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
                        </div>
                        <div>
                          <h3 className='text-base font-bold text-gray-900 leading-tight'>{car.ownerDetails.name}</h3>
                          <p className='text-xs text-gray-500 font-medium'>Car Owner</p>
                        </div>
                      </div>
                      <div className='hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-primary/10 transition-colors'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              <hr className='border-borderColor my-6' />

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                {[
                  { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                  { icon: assets.fuel_icon, text: car.fuel_type },
                  { icon: assets.car_icon, text: car.transmission },
                  { icon: assets.location_icon, text: car.location },
                ].map(({ icon, text }) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                    <img src={icon} alt="" className='h-5 mb-2' />
                    {text}
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h1 className='text-xl font-medium mb-3'>Description</h1>
                <p className='text-gray-500'>{car.description}</p>
              </div>

              {/* Features (كودك الأصلي زي ما هو) */}
              {(() => {
                let featuresList = ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"];
                if (car.features) {
                  if (Array.isArray(car.features) && car.features.filter(f => typeof f === 'string' && f.trim() !== '').length > 0) {
                    featuresList = car.features.filter(f => typeof f === 'string' && f.trim() !== '');
                  } else if (typeof car.features === 'string' && car.features.trim() !== '') {
                    featuresList = car.features.split(',').map(f => f.trim()).filter(f => f !== '');
                  }
                }

                return (
                  <div>
                    <h1 className='text-xl font-medium mb-3'>Features</h1>
                    <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {
                        featuresList.map((item, index) => (
                          <li key={index} className='flex items-center text-gray-500'>
                            <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                            {item}
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                );
              })()}

            </motion.div>

          </motion.div>

          {/* Right: Booking Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

            <div className='flex flex-col gap-1'>
              <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
                {calculatedPrice ? calculatedPrice.totalPrice.toLocaleString() : car.pricePerDay.toLocaleString()} {currency}
                {calculatedPrice ? 
                  <span className='text-base text-gray-400 font-normal'>Total Price</span> :
                  <span className='text-base text-gray-400 font-normal'>per day</span>
                }
              </p>
              
              {calculatedPrice && calculatedPrice.breakdown && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className='mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'
                >
                  <div className='bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
                    <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Price Details
                    </h3>
                    <span className='text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md'>
                      {calculatedPrice.breakdown.totalDays} Days
                    </span>
                  </div>
                  
                  <div className='p-4 space-y-3 text-sm'>
                    {/* Base Rate */}
                    <div className='flex justify-between items-center text-gray-600'>
                      <span>Base Rate ({car.pricePerDay} x {calculatedPrice.breakdown.totalDays})</span>
                      <span className='font-medium'>{(calculatedPrice.breakdown.basePrice * calculatedPrice.breakdown.totalDays).toLocaleString()} {currency}</span>
                    </div>

                    {/* Seasonal Adjustments */}
                    {calculatedPrice.breakdown.seasonName && (
                      <div className={`flex justify-between items-center ${calculatedPrice.breakdown.seasonalMultiplier > 1 ? 'text-orange-500' : 'text-green-600'}`}>
                        <span className='flex items-center gap-1.5'>
                          {calculatedPrice.breakdown.seasonalMultiplier > 1 ? '☀️' : '❄️'} {calculatedPrice.breakdown.seasonName}
                        </span>
                        <span className='font-medium'>
                          {calculatedPrice.breakdown.seasonalMultiplier > 1 ? '+' : '-'}{Math.abs(Math.round((calculatedPrice.breakdown.seasonalMultiplier - 1) * 100))}%
                        </span>
                      </div>
                    )}

                    {/* Market Demand */}
                    {calculatedPrice.breakdown.demandMultiplier !== 1 && (
                      <div className={`flex justify-between items-center ${calculatedPrice.breakdown.demandMultiplier > 1 ? 'text-orange-500' : 'text-green-600'}`}>
                        <span className='flex items-center gap-1.5'>
                          {calculatedPrice.breakdown.demandMultiplier > 1 ? '📈' : '📉'} {calculatedPrice.breakdown.demandLabel}
                        </span>
                        <span className='font-medium'>
                          {calculatedPrice.breakdown.demandMultiplier > 1 ? '+' : '-'}{Math.abs(Math.round((calculatedPrice.breakdown.demandMultiplier - 1) * 100))}%
                        </span>
                      </div>
                    )}

                    {/* Car Feature Discounts */}
                    {calculatedPrice.breakdown.carFeatureMultiplier !== 1 && (
                      <div className='flex justify-between items-center text-green-600'>
                        <span className='flex items-center gap-1.5'>
                          📉 {calculatedPrice.breakdown.carFeatureLabel}
                        </span>
                        <span className='font-medium'>
                          -{Math.round((1 - calculatedPrice.breakdown.carFeatureMultiplier) * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Weekend / Weekday Surcharge */}
                    {calculatedPrice.breakdown.weekendDays > 0 && (
                      <div className='flex justify-between items-center text-orange-500'>
                        <span className='flex items-center gap-1.5'>
                           📅 Weekend Rate ({calculatedPrice.breakdown.weekendDays} days)
                        </span>
                        <span className='font-medium'>+15%</span>
                      </div>
                    )}
                    
                    {calculatedPrice.breakdown.weekdayDays > 0 && calculatedPrice.breakdown.seasonalMultiplier === 1.0 && calculatedPrice.breakdown.demandMultiplier <= 1.0 && (
                      <div className='flex justify-between items-center text-green-600'>
                        <span className='flex items-center gap-1.5'>
                           📉 Normal Weekday ({calculatedPrice.breakdown.weekdayDays} days)
                        </span>
                        <span className='font-medium'>-20%</span>
                      </div>
                    )}



                    {/* Duration Discount */}
                    {calculatedPrice.breakdown.durationDiscount !== 1 && (
                      <div className='flex justify-between items-center text-green-600'>
                        <span className='flex items-center gap-1.5'>
                          📉 Long-Term Discount
                        </span>
                        <span className='font-medium'>-{Math.round((1 - calculatedPrice.breakdown.durationDiscount) * 100)}%</span>
                      </div>
                    )}

                    {/* Price Cap Indicator */}
                    {calculatedPrice.breakdown.capped && (
                      <div className='flex justify-between items-center text-blue-600 bg-blue-50 p-2 rounded-lg mt-2'>
                        <span className='flex items-center gap-1.5 text-xs font-semibold'>
                          🛡️ Price Protection Applied
                        </span>
                        <span className='font-medium text-xs'>
                          {calculatedPrice.breakdown.capped === "max" ? "Capped at +15%" : "Capped at -15%"}
                        </span>
                      </div>
                    )}

                    {/* Taxes and Fees */}
                    {calculatedPrice.breakdown.taxAmount > 0 && (
                      <div className='flex justify-between items-center text-gray-600 mt-2'>
                        <span className='flex items-center gap-1.5'>
                          🧾 Taxes & Fees (10%)
                        </span>
                        <span className='font-medium'>+{calculatedPrice.breakdown.taxAmount.toLocaleString()} {currency}</span>
                      </div>
                    )}

                    <hr className='border-gray-100 my-2' />
                    
                    <div className='flex justify-between items-center text-base font-bold text-gray-900'>
                      <span>Total Amount</span>
                      <span className='text-primary'>{calculatedPrice.totalPrice.toLocaleString()} {currency}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <hr className='border-borderColor my-6' />

  <div className='flex flex-col gap-2 [&_.react-datepicker-wrapper]:w-full'>
              <label htmlFor="pickup-date">Pickup Date</label>
              <div className='relative'>
                <DatePicker
                  id='pickup-date'
                  selected={pickupDate ? new Date(pickupDate) : null}
                  onChange={(date) => {
                    const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                    setPickupDate(formattedDate);
                    if (returnDate && new Date(returnDate) <= date) {
                      setReturnDate('');
                    }
                  }}
                  minDate={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    return tomorrow;
                  })()}
                  excludeDates={bookedDates}
                  placeholderText="mm/dd/yyyy"
                  className='border border-borderColor pl-3 pr-10 py-2 rounded-lg w-full outline-none focus:border-primary transition-colors cursor-pointer'
                  required
                />
                {/* أيقونة النتيجة */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              </div>
            </div>

  <div className='flex flex-col gap-2 [&_.react-datepicker-wrapper]:w-full'>
              <label htmlFor="return-date">Return Date</label>
              <div className='relative'>
                <DatePicker
                  id='return-date'
                  selected={returnDate ? new Date(returnDate) : null}
                  onChange={(date) => {
                    const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                    setReturnDate(formattedDate);
                  }}
                  minDate={(() => {
                    if (pickupDate) {
                      const nextDay = new Date(pickupDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      return nextDay;
                    }
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 2);
                    tomorrow.setHours(0, 0, 0, 0);
                    return tomorrow;
                  })()}
                  excludeDates={bookedDates}
                  placeholderText="mm/dd/yyyy"
                  className='border border-borderColor pl-3 pr-10 py-2 rounded-lg w-full outline-none focus:border-primary transition-colors cursor-pointer'
                  required
                  disabled={!pickupDate}
                />
                {/* أيقونة النتيجة */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              </div>
            </div>
            <button
              disabled={!car.isAvaliable || isCalculating}
              className={`w-full transition-all py-3 font-medium text-white rounded-xl ${(!car.isAvaliable || isCalculating) ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dull cursor-pointer'}`}
            >
              {!car.isAvaliable ? 'Not Available' : isCalculating ? 'Calculating...' : 'Book Now'}
            </button>

          </motion.form>

        </div>

        {/* Owner Details Modal */}
        {showOwnerModal && car?.ownerDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="h-32 bg-gradient-to-r from-primary to-emerald-400 relative">
                <button 
                  onClick={() => setShowOwnerModal(false)}
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 pb-8 text-center -mt-16 relative z-10">
                <img 
                  src={car.ownerDetails.image || assets.profile_icon} 
                  alt="Owner" 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg mx-auto mb-4 bg-white"
                />
                <h2 className="text-2xl font-bold text-gray-900">{car.ownerDetails.name}</h2>
                <p className="text-sm text-gray-500 font-medium mb-6">Car Owner</p>
                
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Joined</p>
                    <p className="font-medium text-gray-900">
                      {new Date(car.ownerDetails.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Response Rate</p>
                    <p className="font-medium text-gray-900">100%</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowOwnerModal(false)}
                  className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    ) : <Loader />
  }

  export default CarDetails