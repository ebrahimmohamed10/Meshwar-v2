import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'motion/react'

/* ── tiny animated trash icon that wiggles on hover ── */
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4 flex-shrink-0 group-hover:animate-[wiggle_0.4s_ease-in-out]">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4 flex-shrink-0">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

const MyBookings = () => {

  const { axios, user, currency, fetchUser } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [confirmCancelId, setConfirmCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'confirmed', 'pending', 'cancelled'
  const [visiblePins, setVisiblePins] = useState({}) // { bookingId: true/false }

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success) {
        setBookings(data.bookings)
        fetchUser() // Refresh user data to update wallet balance
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCancelBooking = async () => {
    if (!confirmCancelId) return
    setCancelling(true)
    try {
      const { data } = await axios.delete(`/api/bookings/cancel/${confirmCancelId}`)
      if (data.success) {
        toast.success('Booking cancelled successfully')
        setBookings(prev => prev.map(b => b._id === confirmCancelId ? { ...b, status: 'cancelled' } : b))
        fetchUser() // Refresh user data to update wallet balance
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setCancelling(false)
      setConfirmCancelId(null)
    }
  }

  useEffect(() => {
    user && fetchMyBookings()
  }, [user])

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50/50 pb-24">
      {/* ── Background Blobs & Grid ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_10%,transparent_100%)]" />
      </div>

      <style>{`
        @keyframes wiggle {
          0%,100%{ transform: rotate(0deg); }
          25%    { transform: rotate(-12deg); }
          75%    { transform: rotate(12deg); }
        }
        @keyframes ping-slow {
          0%  { transform: scale(1);   opacity:.5; }
          70% { transform: scale(1.9); opacity:0;  }
          100%{ transform: scale(1.9); opacity:0;  }
        }
        .ping-slow { animation: ping-slow 1.8s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='relative z-10 px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 pt-16 text-sm max-w-screen-2xl mx-auto'>

        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Title title='My Bookings' subTitle='View and manage all your upcoming and past reservations' align="left" />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl shadow-sm text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${filter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'}`}>
              All Bookings
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-xl shadow-sm text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${filter === 'confirmed' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'}`}>
              <span className={`w-2 h-2 rounded-full ${filter === 'confirmed' ? 'bg-white' : 'bg-emerald-500'}`}></span>
              {bookings.filter(b => b.status === 'confirmed').length} Active
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl shadow-sm text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${filter === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'}`}>
              <span className={`w-2 h-2 rounded-full ${filter === 'pending' ? 'bg-white' : 'bg-amber-500'}`}></span>
              {bookings.filter(b => b.status === 'pending').length} Pending
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-xl shadow-sm text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${filter === 'cancelled' ? 'bg-slate-500 text-white border-slate-500' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'}`}>
              <span className={`w-2 h-2 rounded-full ${filter === 'cancelled' ? 'bg-white' : 'bg-slate-500'}`}></span>
              {bookings.filter(b => b.status === 'cancelled').length} Cancelled
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {bookings.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-white"
              >
                <img src={assets.dashboardIconColored} alt="No bookings" className="w-16 h-16 opacity-50 mb-4 grayscale" />
                <h3 className="text-xl font-bold text-gray-800">No bookings yet</h3>
                <p className="text-gray-500 mt-2 max-w-md">You haven't made any car reservations yet. Start exploring our cars to find your perfect ride.</p>
              </motion.div>
            )}

            {bookings
              .filter(b => filter === 'all' ? true : b.status === filter)
              .map((booking, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -80, scale: 0.95, transition: { duration: 0.4 } }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  key={booking._id}
                  className='relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-7 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group overflow-hidden'>

                  {/* Glass highlight inside card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                  {/* Car Image + Info */}
                  <div className='lg:col-span-3 flex flex-col relative z-10'>
                    <div className='rounded-2xl overflow-hidden mb-5 bg-gradient-to-b from-gray-50 to-gray-100/50 p-4 relative group-hover:bg-primary/5 transition-colors duration-500 flex items-center justify-center min-h-[160px]'>
                      <img src={booking?.car?.image} alt="" className='w-full h-auto object-contain group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out drop-shadow-xl relative z-10' />
                    </div>
                    <h2 className='text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5'>{booking?.car?.brand} {booking?.car?.model}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-600">{booking?.car?.year}</span>
                      <span className='text-gray-400 text-sm font-semibold'>• {booking?.car?.category}</span>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className='lg:col-span-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-200/60 pt-6 lg:pt-0 lg:pl-8 relative z-10'>
                    <div className='flex flex-wrap items-center gap-3 mb-6'>
                      <span className='px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm'>
                        Booking #{bookings.length - index}
                      </span>
                    </div>

                    <div className='flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group-hover:border-primary/20 group-hover:shadow-md transition-all duration-300'>

                      {/* Top: Dates */}
                      <div className="p-5 relative border-b border-gray-100 border-dashed">

                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                              <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 opacity-80' />
                            </div>
                            <span className='text-[11px] text-gray-400 font-black uppercase tracking-widest'>Rental Period</span>
                          </div>
                          <span className="text-[11px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md shadow-sm">
                            {(() => {
                              const days = Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)));
                              return days === 1 ? '1 Day' : `${days} Days`;
                            })()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">Pick-up</p>
                            <p className='text-[15px] font-black text-gray-900'>{new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="flex-1 px-4 flex items-center justify-center relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">Return</p>
                            <p className='text-[15px] font-black text-gray-900'>{new Date(booking.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Locations */}
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gray-50/50'>
                        <div className='flex items-center gap-6 flex-1'>
                          {/* Pickup Location */}
                          <div className='flex items-center gap-3'>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <svg className='w-4 h-4 text-emerald-500' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                              </svg>
                            </div>
                            <div>
                              <p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5'>Pick-up</p>
                              <p className='text-[13px] font-bold text-gray-900 truncate max-w-[180px]'>{booking?.pickupLocation || booking?.car?.location}</p>
                            </div>
                          </div>

                          {/* Arrow separator */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>

                          {/* Return Location */}
                          <div className='flex items-center gap-3'>
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                              <svg className='w-4 h-4 text-blue-500' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                              </svg>
                            </div>
                            <div>
                              <p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5'>Return</p>
                              <p className='text-[13px] font-bold text-gray-900 truncate max-w-[180px]'>{booking?.returnLocation || booking?.car?.location}</p>
                            </div>
                          </div>
                        </div>

                        <span className={`relative overflow-hidden px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-full flex items-center gap-2 transition-all duration-500 shadow-sm border ${booking.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5'
                          : booking.status === 'cancelled'
                            ? 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                            : booking.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/5'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5'
                          }`}>
                          {/* Glossy Shimmer Effect */}
                          <span className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />

                          {/* Interactive Status Indicator */}
                          <span className="relative flex h-2 w-2">
                            {(booking.status === 'confirmed' || booking.status === 'pending') && (
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${booking.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'cancelled' ? 'bg-slate-400' : booking.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`}></span>
                          </span>

                          <span className="relative z-10">{booking.status}</span>
                        </span>
                      </div>

                      {booking.status === 'cancelled' && booking.cancellationReason && (
                        <div className="px-5 py-3 bg-rose-50/50 border-t border-rose-100/50 flex items-start gap-3">
                          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <p className="text-[11px] font-bold text-rose-600 leading-relaxed italic">{booking.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price + Cancel Button + PIN Card */}
                  <div className='lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-200/60 pt-6 lg:pt-0 lg:pl-8 relative z-10'>
                    <div className='text-right lg:text-left bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100'>
                      <p className='text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1'>Total Amount</p>
                      <div className="flex items-baseline gap-1 lg:justify-start justify-end">
                        <h1 className='text-3xl font-black text-gray-900 tracking-tight'>
                          {Number(booking.price).toLocaleString()}
                        </h1>
                        <span className='text-base font-bold text-primary'>{currency}</span>
                      </div>
                      <p className='text-[11px] text-gray-400 mt-2 font-semibold uppercase tracking-wider'>Booked: {booking.createdAt.split('T')[0]}</p>
                    </div>

                    {/* ── Handover PIN Card (for confirmed & not yet verified) ── */}
                    {booking.status === 'confirmed' && booking.handoverPin && !booking.handoverVerified && (
                      <div className='mt-4 rounded-2xl overflow-hidden border border-emerald-200 shadow-lg shadow-emerald-500/10'>
                        {/* Header */}
                        <div className='px-4 py-2.5 flex items-center gap-2' style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                          <span className='text-white text-[10px] font-black uppercase tracking-widest'>رمز التحقق الآمن</span>
                        </div>
                        {/* PIN digits */}
                        <div className='bg-white px-4 py-4'>
                          <div className='flex items-center justify-center gap-2.5 mb-3'>
                            {(visiblePins[booking._id]
                              ? booking.handoverPin.split('')
                              : ['•', '•', '•', '•']
                            ).map((digit, i) => (
                              <div key={i}
                                className='w-11 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-emerald-700 shadow-sm border-2 border-emerald-200 bg-emerald-50 select-none'
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {digit}
                              </div>
                            ))}
                          </div>
                          {/* Toggle visibility */}
                          <button
                            onClick={() => setVisiblePins(prev => ({ ...prev, [booking._id]: !prev[booking._id] }))}
                            className='w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors mb-3'
                          >
                            {visiblePins[booking._id] ? (
                              <><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>إخفاء الرمز</>
                            ) : (
                              <><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>إظهار الرمز</>
                            )}
                          </button>
                          {/* Warning message */}
                          <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5'>
                            <svg className='w-3 h-3 text-amber-500 shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' /></svg>
                            <p className='text-[10px] font-bold text-amber-700 leading-relaxed'>أعطِ هذا الرمز للمالك <span className='text-amber-900'>فقط</span> عندما تكون مفاتيح السيارة بحوزتك.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Handover Completed Badge ── */}
                    {booking.status === 'confirmed' && booking.handoverVerified && (
                      <div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0'>
                          <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7'/></svg>
                        </div>
                        <div>
                          <p className='text-[11px] font-black text-emerald-700 uppercase tracking-wider'>تم الاستلام</p>
                          <p className='text-[10px] text-emerald-600 font-semibold'>تم تحويل الأرباح للمالك بنجاح</p>
                        </div>
                      </div>
                    )}

                    <div className='mt-5'>
                      {/* ── Cancel / Locked button ── */}
                      {booking.status === 'pending' ? (
                        <div className='relative'>
                          {/* pulsing ring behind button */}
                          <span className='ping-slow absolute inset-0 rounded-xl bg-red-400/25 pointer-events-none' />

                          <button
                            onClick={() => setConfirmCancelId(booking._id)}
                            className='group/btn relative w-full overflow-hidden flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 active:translate-y-0 active:shadow-md'
                            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 8px 20px -6px rgba(239,68,68,0.5)' }}
                          >
                            {/* gloss overlay */}
                            <span className='absolute inset-0 rounded-xl' style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 60%)' }} />
                            {/* sweep shimmer */}
                            <span className='absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[800ms] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none rounded-xl' />

                            <TrashIcon />
                            <span className='relative tracking-wide'>Cancel Booking</span>
                          </button>
                        </div>
                      ) : (
                        <div className='relative group/lock w-full'>
                          <button
                            disabled
                            className='w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed select-none transition-all'
                          >
                            <LockIcon />
                            <span className="tracking-wide">Cancellation Locked</span>
                          </button>
                          {/* tooltip on hover */}
                          <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover/lock:opacity-100 transition-all duration-300 pointer-events-none shadow-xl z-20 translate-y-2 group-hover/lock:translate-y-0'>
                            Cancellation not available after approval
                            <span className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900' />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* ══════════════════════════════════════════
          CONFIRMATION MODAL — creative redesign
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {confirmCancelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center px-4'
            style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => !cancelling && setConfirmCancelId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className='relative bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden border border-white/20'
              onClick={e => e.stopPropagation()}
            >

              {/* ── coloured top band with icon ── */}
              <div className='relative h-36 flex items-center justify-center overflow-hidden'
                style={{ background: 'linear-gradient(135deg,#ef4444 0%,#b91c1c 100%)' }}>

                {/* decorative circles */}
                <div className='absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl' />
                <div className='absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10 blur-xl' />

                {/* main icon */}
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className='relative z-10 w-20 h-20 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.div>
              </div>

              {/* ── body ── */}
              <div className='px-8 pt-8 pb-8'>
                <h2 className='text-2xl font-black text-gray-900 text-center mb-2 tracking-tight'>Cancel Reservation?</h2>
                <p className='text-gray-500 text-sm text-center leading-relaxed mb-8'>
                  This booking will be cancelled and the amount will be refunded to your wallet.<br />
                  <span className='text-red-500 font-bold'>This action cannot be undone.</span>
                </p>

                <div className='flex gap-4'>
                  {/* Keep button */}
                  <button
                    onClick={() => setConfirmCancelId(null)}
                    disabled={cancelling}
                    className='flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all duration-300 text-sm font-bold disabled:opacity-50'
                  >
                    Keep It
                  </button>

                  {/* Confirm cancel button */}
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className='group flex-1 relative overflow-hidden py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2'
                    style={{ background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)', boxShadow: '0 8px 20px -6px rgba(239,68,68,0.5)' }}
                  >
                    <span className='absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                    {cancelling ? (
                      <>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Yes, Cancel
                      </>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyBookings
