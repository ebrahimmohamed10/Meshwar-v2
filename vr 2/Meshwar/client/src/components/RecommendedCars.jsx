import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const RecommendedCars = () => {
  const { currency, cars } = useAppContext();
  const [recommendedCars, setRecommendedCars] = useState([]);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (cars && cars.length > 0) {
      // Sort cars by bookingCount descending
      const sortedByPopularity = [...cars].sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));
      // Get sub-array of top 8 highest booked cars
      setRecommendedCars(sortedByPopularity.slice(0, 8));
    }
  }, [cars]);

  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current || recommendedCars.length === 0 || isHovered) return;

    const intervalId = setInterval(() => {
      if (scrollRef.current && scrollRef.current.children.length > 0) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Check if we reached the end (with a small 5px buffer for rounding errors)
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          // Scroll back to the beginning smoothly
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Calculate the width of a single card + the gap between them (gap-6 = 24px)
          const scrollAmount = scrollRef.current.children[0].offsetWidth + 24; 
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [recommendedCars, isHovered]);

  // Function to handle left/right scrolling
  const scroll = (direction) => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const scrollAmount = scrollRef.current.children[0].offsetWidth + 24; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (recommendedCars.length === 0) return null;

  return (
    <div className="w-full bg-white py-10 border-b border-gray-100 overflow-hidden">
      {/* Container with extra horizontal padding for arrow space */}
      <div className="max-w-[1400px] mx-auto px-12 md:px-24">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Cars</h2>
        
        {/* Slider Container with Relative Positioning */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Left Arrow - Positioned completely outside the cards */}
          {recommendedCars.length > 3 && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-[-30px] md:left-[-75px] top-[45%] -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all shadow-xl opacity-90 hover:opacity-100"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Cards container */}
          <div 
            ref={scrollRef} 
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {recommendedCars.map((car) => (
              // Card component with original styling
              <div 
                key={car._id} 
                onClick={() => { navigate(`/car-details/${car._id}`); window.scrollTo(0, 0); }}
                className="snap-start shrink-0 w-[calc(100%)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] group/card border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white p-4 cursor-pointer"
              >
                
                {/* Image Section */}
                <div className="relative h-56 w-full rounded-xl overflow-hidden mb-4 bg-gray-50">
                  <div className={`absolute top-3 left-3 z-10 ${car.available !== false ? 'bg-[#16A34A]' : 'bg-red-500'} text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
                    {car.available !== false ? '✓ Available' : '✕ Unavailable'}
                  </div>
                  
                  <div className="absolute top-3 right-3 z-10 bg-gray-500/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {car.category}
                  </div>

                  <img 
                    src={car.image} 
                    alt={car.model} 
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                  />
                  
                  <div className="absolute bottom-3 right-3 z-10 bg-white text-gray-900 text-sm font-bold px-3 py-1.5 rounded-xl shadow-md">
                    {car.pricePerDay?.toLocaleString()} {currency || 'EGP'} <span className="text-[10px] text-gray-500 font-normal">/day</span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {car.brand} {car.model}
                  </h3>
                  <div className="text-sm text-gray-400 font-medium">
                    {car.year}
                  </div>
                  
                  {/* Detailed Grid Icons (Fixed) */}
                  <div className="grid grid-cols-2 gap-2 mb-6 mt-4">
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg text-xs text-gray-500 font-medium">
                      <img src={assets.users_icon} alt="" className="h-4 w-4 opacity-50" />
                      {car.seating_capacity} Seats
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg text-xs text-gray-500 font-medium">
                      <img src={assets.fuel_icon} alt="" className="h-4 w-4 opacity-50" />
                      {car.fuel_type}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg text-xs text-gray-500 font-medium">
                      <img src={assets.car_icon} alt="" className="h-4 w-4 opacity-50" />
                      {car.transmission}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg text-xs text-gray-500 font-medium">
                      <img src={assets.location_icon} alt="" className="h-4 w-4 opacity-50" />
                      {car.location}
                    </div>
                  </div>

                  {/* Booking Link - Ensures it opens at the top like Featured Vehicles */}
                  <div 
                    className="block w-full text-center border border-[#16A34A] text-[#16A34A] font-bold py-2.5 rounded-xl hover:bg-[#16A34A] hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    View Details &rarr;
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow - Positioned completely outside the cards */}
          {recommendedCars.length > 3 && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-[-30px] md:right-[-75px] top-[45%] -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition-all shadow-xl opacity-90 hover:opacity-100"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default RecommendedCars;
