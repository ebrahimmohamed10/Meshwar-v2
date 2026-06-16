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
              <div 
                key={car._id} 
                onClick={() => { navigate(`/car-details/${car._id}`); window.scrollTo(0, 0); }}
                className="snap-start shrink-0 w-[calc(100%)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] group/card bg-white rounded-[20px] overflow-hidden hover:shadow-[0_20px_60px_-15px_rgba(60,158,122,0.15)] transition-all duration-500 cursor-pointer relative"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(90deg, #3c9e7a, #27ae60, #3c9e7a)' }} />

                {/* Image */}
                <div className="relative h-[200px] m-3 rounded-2xl overflow-hidden">
                  <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover/card:scale-[1.08] transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 -60px 60px -30px rgba(0,0,0,0.15)' }} />
                  
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
                    style={{ background: 'rgba(60,158,122,0.9)', backdropFilter: 'blur(8px)' }}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Available
                  </div>

                  <div className="absolute top-2.5 right-2.5 z-10 px-3 py-1.5 rounded-full text-[11px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {car.category}
                  </div>
                </div>
                
                {/* Content */}
                <div className="px-5 pb-5 pt-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-[17px] font-bold text-gray-900 leading-tight tracking-[-0.01em] group-hover/card:text-primary transition-colors duration-300 truncate">{car.brand} {car.model}</h3>
                      <p className="text-[12px] text-gray-400 mt-1 font-medium">{car.year} · {car.category}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="px-3.5 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #f0fdf6, #e8f7f1)' }}>
                        <p className="text-[16px] font-extrabold text-primary leading-none tracking-tight">{car.pricePerDay?.toLocaleString()}</p>
                        <p className="text-[10px] text-primary/60 font-medium mt-0.5">{currency || 'EGP'}/day</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

                  {/* Specs */}
                  <div className="flex items-center justify-between text-center mb-5">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/[0.07] flex items-center justify-center group-hover/card:bg-primary/[0.12] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">{car.seating_capacity} Seats</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/[0.07] flex items-center justify-center group-hover/card:bg-primary/[0.12] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">{car.fuel_type}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/[0.07] flex items-center justify-center group-hover/card:bg-primary/[0.12] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">{car.transmission}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary/[0.07] flex items-center justify-center group-hover/card:bg-primary/[0.12] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500 truncate max-w-[65px]">{car.location}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="w-full py-3 text-center text-sm font-bold tracking-wide text-white rounded-xl relative overflow-hidden group-hover/card:shadow-md transition-all duration-400"
                    style={{ background: 'linear-gradient(135deg, #3c9e7a 0%, #2d8a68 50%, #27ae60 100%)', boxShadow: '0 4px 15px rgba(60, 158, 122, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Book Now
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
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