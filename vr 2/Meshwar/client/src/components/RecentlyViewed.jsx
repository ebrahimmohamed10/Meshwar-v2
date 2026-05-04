import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const RecentlyViewed = () => {
  const { currency } = useAppContext();
  const [recentCars, setRecentCars] = useState([]);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let storedCars = JSON.parse(localStorage.getItem('recentlyViewedCars')) || [];
    
    // Filter out old/incomplete data
    storedCars = storedCars.filter(car => car.fuel_type && car.seating_capacity);
    localStorage.setItem('recentlyViewedCars', JSON.stringify(storedCars));
    
    setRecentCars(storedCars);
  }, []);

  // Function to handle left/right scrolling
  const scroll = (direction) => {
    if (scrollRef.current) {
      // Calculate the width of a single card + the gap between them (gap-6 = 24px)
      const scrollAmount = scrollRef.current.children[0].offsetWidth + 24; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (recentCars.length === 0) return null;

  return (
    <div className="w-full bg-white py-10 border-b border-gray-100 overflow-hidden">
      {/* Container with extra horizontal padding for arrow space */}
      <div className="max-w-[1400px] mx-auto px-12 md:px-24">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
        
        {/* Slider Container with Relative Positioning */}
        <div className="relative group">
          
          {/* Left Arrow - Positioned completely outside the cards */}
          {recentCars.length > 3 && (
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
            {recentCars.map((car) => (
              // Card component with original styling
              <div 
                key={car._id} 
                className="snap-start shrink-0 w-[calc(100%)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] group/card border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white p-4"
              >
                
                {/* Image Section */}
                <div className="relative h-56 w-full rounded-xl overflow-hidden mb-4 bg-gray-50">
                  <div className="absolute top-3 left-3 z-10 bg-[#16A34A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    ✓ Available
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
                  <button 
                    onClick={() => { navigate(`/car-details/${car._id}`); window.scrollTo(0, 0); }}
                    className="block w-full text-center border border-[#16A34A] text-[#16A34A] font-bold py-2.5 rounded-xl hover:bg-[#16A34A] hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow - Positioned completely outside the cards */}
          {recentCars.length > 3 && (
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

export default RecentlyViewed;