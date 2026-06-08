import React, { useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import { assets } from '../../assets/assets'

const ManageBookings = () => {

  const { currency, axios, user, isOwner, isPremium } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [rejectModalBookingId, setRejectModalBookingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [pinInputs, setPinInputs] = useState({})         // { bookingId: '1234' }
  const [verifyingPin, setVerifyingPin] = useState(null) // bookingId currently being verified

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/owner')
      if (data.success) {
        setBookings(data.bookings || [])
      } else if (data.message !== "Unauthorized") {
        toast.error(data.message)
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.message)
      }
    }
  }

  useEffect(() => {
    if (user && (isOwner || isPremium || user.isPremium)) {
      fetchOwnerBookings()
    }
  }, [user, isOwner, isPremium])

  const changeBookingStatus = async (bookingId, status, reason = '') => {
    try {
      const payload = { bookingId, status }
      if (status === 'rejected' && reason) {
        payload.rejectionReason = reason
      }
      const { data } = await axios.post('/api/bookings/change-status', payload)
      if (data.success) {
        toast.success(data.message)
        fetchOwnerBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleReject = async () => {
    if (!rejectModalBookingId) return
    setRejecting(true)
    await changeBookingStatus(rejectModalBookingId, 'rejected', rejectionReason)
    setRejecting(false)
    setRejectModalBookingId(null)
    setRejectionReason('')
  }

  const handleVerifyPin = async (bookingId) => {
    const pin = (pinInputs[bookingId] || '').trim()
    if (pin.length !== 4) {
      toast.error('Please enter the complete 4-digit PIN')
      return
    }
    setVerifyingPin(bookingId)
    try {
      const { data } = await axios.post('/api/bookings/verify-pin', { bookingId, pin })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerBookings()
        setPinInputs(prev => { const n = { ...prev }; delete n[bookingId]; return n })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setVerifyingPin(null)
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])

  return (
    <div className='px-4 pt-10 md:px-10 w-full min-h-screen bg-[#F9FAFB] pb-10'>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage your car reservations and customer payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
            <span className="text-gray-400 mr-2">Total Bookings:</span>
            {bookings.length}
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <h3 className="text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="text-sm text-gray-500 mt-1">You don't have any active reservations yet.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Locations</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings && bookings.length > 0 && bookings.map((booking, index) => {
                  if (!booking) return null;

                  const pickupDate = booking.pickupDate ? new Date(booking.pickupDate) : null;
                  const returnDate = booking.returnDate ? new Date(booking.returnDate) : null;
                  const isValidDates = pickupDate && returnDate && !isNaN(pickupDate) && !isNaN(returnDate);

                  return (
                    <tr key={booking._id || index} className="hover:bg-gray-50/50 transition-colors group">

                      {/* Car Info */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={booking.car?.image || assets.car_icon}
                            alt=""
                            className="h-10 w-14 object-cover rounded shadow-sm border border-gray-100 mr-3"
                            onError={(e) => { e.target.src = assets.car_icon }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.car?.brand || 'Deleted Car'}</div>
                            <div className="text-xs text-gray-500">{booking.car?.model || 'Unknown Model'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs mr-3">
                            {booking.user?.name ? String(booking.user.name).charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.user?.name || 'Unknown User'}</div>
                            <div className="text-xs text-gray-500">{booking.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {isValidDates ? pickupDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                          <span className="text-gray-400 mx-1">-</span>
                          {isValidDates ? returnDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {isValidDates ? Math.max(0, Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24))) : 0} Days
                        </div>
                      </td>

                      {/* Locations */}
                      <td className="py-4 px-6">
                        <div className="space-y-2 min-w-[160px]">
                          {booking.pickupLocation ? (
                            <>
                              <div className="flex items-start gap-2">
                                <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pickup</div>
                                  <div className="text-xs font-medium text-gray-900">{booking.pickupLocation}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <svg className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Return</div>
                                  <div className="text-xs font-medium text-gray-900">{booking.returnLocation || booking.pickupLocation}</div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not specified</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {typeof booking.price === 'number' ? booking.price.toLocaleString() : '0'} <span className="text-xs text-gray-500 font-normal">{currency}</span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase
                          ${booking.paymentMethod === 'Credit Card' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10' :
                            (booking.paymentMethod === 'Apple Pay' || booking.paymentMethod === 'Express Checkout') ? 'bg-gray-50 text-gray-800 ring-1 ring-inset ring-gray-800/10' :
                              'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10'}`}>
                          {booking.paymentMethod === 'Credit Card' && <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>}
                          {(booking.paymentMethod === 'Apple Pay' || booking.paymentMethod === 'Express Checkout') && <svg className="w-3 h-3 mr-1" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>}
                          {booking.paymentMethod === 'Express Checkout' ? 'Apple Pay' : (booking.paymentMethod || 'Offline')}
                        </span>
                      </td>

                      {/* Status & Actions */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        {booking.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => changeBookingStatus(booking._id, 'confirmed')}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 font-medium text-xs rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setRejectModalBookingId(booking._id); setRejectionReason(''); }}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 font-medium text-xs rounded-md hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : booking.status === 'confirmed' && !booking.handoverVerified ? (
                          // ── PIN input for handover verification ──
                          <div className="flex flex-col items-end gap-2 min-w-[190px]">
                            <div className="flex items-center gap-1.5">
                              {/* 4 individual digit boxes */}
                              {[0, 1, 2, 3].map(i => (
                                <input
                                  key={i}
                                  id={`pin-${booking._id}-${i}`}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={(pinInputs[booking._id] || '')[i] || ''}
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    const current = (pinInputs[booking._id] || '').split('')
                                    current[i] = val
                                    const next = current.join('').slice(0, 4)
                                    setPinInputs(prev => ({ ...prev, [booking._id]: next }))
                                    // auto-focus next
                                    if (val && i < 3) {
                                      document.getElementById(`pin-${booking._id}-${i + 1}`)?.focus()
                                    }
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Backspace' && !(pinInputs[booking._id] || '')[i] && i > 0) {
                                      document.getElementById(`pin-${booking._id}-${i - 1}`)?.focus()
                                    }
                                  }}
                                  className="w-9 h-10 text-center text-sm font-black text-emerald-700 border-2 border-emerald-200 rounded-lg bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => handleVerifyPin(booking._id)}
                              disabled={verifyingPin === booking._id}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                              {verifyingPin === booking._id ? (
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              )}
                              {verifyingPin === booking._id ? 'Verifying...' : 'Start Rental & Collect Earnings'}
                            </button>
                            <p className="text-[10px] text-gray-400 font-medium text-right leading-tight">Enter the user's PIN to start the rental</p>
                          </div>
                        ) : booking.status === 'confirmed' && booking.handoverVerified ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              <svg className='w-3 h-3' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7'/></svg>
                              Handed Over
                            </span>
                            <p className="text-[10px] text-gray-400 font-medium">Earnings Collected</p>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold
                            ${'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10'}`}>
                            {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
                          </span>
                        )}
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalBookingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => !rejecting && setRejectModalBookingId(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Reject Booking</h3>
              <p className="text-sm text-gray-500 mt-1">Optionally provide a reason or suggest a different location.</p>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. I can't meet at that location. Please try Downtown Cairo or Maadi."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10 outline-none text-sm font-medium transition-all resize-none placeholder:text-gray-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModalBookingId(null)}
                  disabled={rejecting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {rejecting ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  ) : null}
                  {rejecting ? 'Rejecting...' : 'Reject Booking'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ManageBookings
