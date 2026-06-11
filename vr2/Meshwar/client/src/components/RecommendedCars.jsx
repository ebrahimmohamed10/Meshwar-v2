import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const RecommendedCars = () => {
  const { currency, cars, axios, user } = useAppContext();
  const [recommendedCars, setRecommendedCars] = useState([]);
  const [aiTitle, setAiTitle] = useState("✨ Recommended Cars");
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const fetchDefaultRecommendations = async () => {
      try {
        const payload = user ? { userId: user._id, message: '' } : { message: '' };
        const { data } = await axios.post('/api/chatbot/smart-recommendations', payload);
        
        if (data.success && isMounted) {
          setRecommendedCars(data.recommendedCars);
          if (data.aiTitle) setAiTitle(data.aiTitle);
        }
      } catch (error) {
        console.error("AI Recommendation failed, falling back to popularity", error);
        // Fallback
        if (cars && cars.length > 0 && isMounted) {
          const sortedByPopularity = [...cars].sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));
          setRecommendedCars(sortedByPopularity.slice(0, 8));
          setAiTitle("Recommended Cars");
        }
      }
    };

    if (cars && cars.length > 0) {
      fetchDefaultRecommendations();
    }

    return () => { isMounted = false; };
  }, [cars, user, axios]);

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current || recommendedCars.length === 0 || isHovered) return;

    const intervalId = setInterval(() => {
      if (scrollRef.current && scrollRef.current.children.length > 0) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const scrollAmount = scrollRef.current.children[0].offsetWidth + 24; 
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000); 

    return () => clearInterval(intervalId); 
  }, [recommendedCars, isHovered]);

  const scroll = (direction) => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const scrollAmount = scrollRef.current.children[0].offsetWidth + 24; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = async (e, query = searchQuery) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const payload = { message: query };
      if (user) payload.userId = user._id;

      const { data } = await axios.post('/api/chatbot/smart-recommendations', payload);
      
      if (data.success) {
        setRecommendedCars(data.recommendedCars);
        setAiTitle(data.aiTitle || "✨ AI Picks");
      } else {
        toast.error("Failed to find recommendations.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong with the AI search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleVibeClick = (vibe) => {
    setSearchQuery(vibe);
    handleSearch(null, vibe);
  };

  if (cars.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white py-12 border-b border-gray-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-12 md:px-24">
        
        {/* AI Search Header Section */}
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{aiTitle}</h2>
          
          <form onSubmit={handleSearch} className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              className="block w-full p-4 pl-12 pr-32 text-sm text-gray-900 border border-gray-200 rounded-2xl bg-white shadow-sm focus:ring-primary focus:border-primary outline-none transition-shadow hover:shadow-md" 
              placeholder="Describe your trip, and let AI find your perfect ride..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
            <button 
              type="submit" 
              disabled={isSearching || !searchQuery.trim()}
              className="text-white absolute right-2.5 bottom-2.5 bg-primary hover:bg-primary-dull focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-xl text-sm px-5 py-2 transition-colors disabled:bg-gray-400"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Quick Filters / Vibes */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "💼 Business Trip", query: "I need a professional car for a business trip" },
              { label: "🏖️ Family Vacation", query: "Looking for a spacious car for a family vacation to the beach" },
              { label: "💰 Budget Friendly", query: "Show me the cheapest, most economical cars" },
              { label: "🚀 Need for Speed", query: "I want something fast, sporty, and fun to drive" }
            ].map((vibe, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleVibeClick(vibe.query)}
                disabled={isSearching}
                className="py-1.5 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors focus:z-10 focus:ring-2 focus:ring-primary"
              >
                {vibe.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Slider Container with Relative Positioning */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Left Arrow */}
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
            {recommendedCars.length === 0 && !isSearching && (
              <div className="w-full text-center py-12 text-gray-500">
                No cars found matching your request. Try a different search!
              </div>
            )}

            {recommendedCars.map((car) => (
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
                  
                  {/* Detailed Grid Icons */}
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

                  {/* Booking Link */}
                  <div 
                    className="block w-full text-center border border-[#16A34A] text-[#16A34A] font-bold py-2.5 rounded-xl hover:bg-[#16A34A] hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    View Details &rarr;
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
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
