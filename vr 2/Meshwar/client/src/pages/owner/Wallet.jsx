import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const maskCardDetails = (details) => {
    if (!details) return ''
    return details
        .replace(/CVV:\s*\d+/gi, 'CVV: ***')
        .replace(/Card:\s*\d[\d\s]{10,18}\d/gi, (match) => {
            const digits = match.replace(/\D/g, '')
            return 'Card: •••• •••• •••• ' + digits.slice(-4)
        })
}

const OwnerWallet = () => {
    const { user, currency, axios, fetchUser } = useAppContext()
    const [bookings, setBookings] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('earnings') // 'earnings' or 'withdrawals'
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)

    const fetchWalletData = async () => {
        try {
            const [bookingsRes, withdrawalsRes] = await Promise.all([
                axios.get('/api/bookings/owner'),
                axios.get('/api/user/withdrawals?walletType=owner')
            ])
            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.bookings || [])
            }
            if (withdrawalsRes.data.success) {
                setWithdrawals(withdrawalsRes.data.withdrawals || [])
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchWalletData()
        }
    }, [user])

    if (!user) return <Loader />
    if (loading) return <Loader />

    // Filter online bookings that generate revenue (exclude offline bookings for virtual wallet)
    const onlineBookings = bookings.filter(b => b.paymentMethod !== 'offline')

    // Calculated metrics
    const totalEarnings = onlineBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.price || 0), 0)

    const pendingEarnings = onlineBookings
        .filter(b => b.status === 'pending')
        .reduce((sum, b) => sum + (b.price || 0), 0)

    return (
        <div className='px-4 pt-10 md:px-10 flex-1 min-h-screen bg-[#F9FAFB] pb-12 relative'>
            <div className='max-w-5xl mx-auto'>
                
                {/* Page Title */}
                <div className='mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Earnings & Wallet</h1>
                        <p className='text-sm text-gray-500 mt-1'>Monitor your rental revenue and request payouts.</p>
                    </div>
                    {/* Withdraw Button */}
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className='px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2 cursor-pointer'
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4-4m0 0l-4-4m4 4H3m14 4h2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-6a2 2 0 0 0 2-2h2"/></svg>
                        Withdraw Funds
                    </button>
                </div>

                {/* KPI stats section */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    
                    {/* Active balance card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-sm border border-emerald-500/20 relative overflow-hidden group'
                    >
                        <div className='absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500'></div>
                        <div className='flex items-center gap-2 text-emerald-100 font-bold mb-3'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                            <span className='text-[10px] uppercase tracking-widest'>Available Balance</span>
                        </div>
                        <h2 className='text-3xl font-black tracking-tight'>
                            {user.ownerWallet?.toLocaleString()} <span className='text-sm text-emerald-200 font-medium'>{currency}</span>
                        </h2>
                        <div className='mt-4 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-100/80'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse' />
                            Secure Assets
                        </div>
                    </motion.div>

                    {/* Pending earnings card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group'
                    >
                        <div className='flex items-center gap-2 text-amber-600 font-bold mb-3'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span className='text-[10px] uppercase tracking-widest'>Pending Approval</span>
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 tracking-tight'>
                            {pendingEarnings?.toLocaleString()} <span className='text-sm text-gray-400 font-medium'>{currency}</span>
                        </h2>
                        <p className='text-xs text-gray-400 mt-4 font-medium'>From online-paid pending reservations</p>
                    </motion.div>

                    {/* Lifetime earnings card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group'
                    >
                        <div className='flex items-center gap-2 text-blue-600 font-bold mb-3'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            <span className='text-[10px] uppercase tracking-widest'>Lifetime Earnings</span>
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 tracking-tight'>
                            {totalEarnings?.toLocaleString()} <span className='text-sm text-gray-400 font-medium'>{currency}</span>
                        </h2>
                        <p className='text-xs text-gray-400 mt-4 font-medium'>Total payout generated so far</p>
                    </motion.div>

                </div>

                {/* Navigation Tabs */}
                <div className='flex items-center gap-8 mb-8 border-b border-gray-200/60'>
                    <button 
                        onClick={() => setActiveTab('earnings')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative cursor-pointer ${activeTab === 'earnings' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Revenues Feed
                        {activeTab === 'earnings' && <motion.div layoutId="ownerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('withdrawals')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative cursor-pointer ${activeTab === 'withdrawals' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Withdrawals Log
                        {activeTab === 'withdrawals' && <motion.div layoutId="ownerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                    </button>
                </div>

                {/* Content Lists */}
                <AnimatePresence mode='wait'>
                    {activeTab === 'earnings' ? (
                        <motion.div 
                            key="earnings"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='space-y-3'
                        >
                            {onlineBookings.length === 0 ? (
                                <EmptyState icon={<svg className='text-gray-200' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>} message="No online rental payments found" />
                            ) : (
                                onlineBookings.map((booking, index) => (
                                    <WalletCard 
                                        key={index} 
                                        item={{
                                            _id: booking._id,
                                            type: 'revenue',
                                            title: `Booking Fee: ${booking.car?.brand} ${booking.car?.model}`,
                                            amount: booking.price,
                                            date: booking.createdAt,
                                            status: booking.status,
                                            raw: booking
                                        }} 
                                        currency={currency} 
                                        onClick={() => setSelectedBooking(booking)} 
                                    />
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="withdrawals"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='space-y-3'
                        >
                            {withdrawals.length === 0 ? (
                                <EmptyState icon={<svg className='text-gray-200' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>} message="No withdrawals found" />
                            ) : (
                                withdrawals.map((withdrawal, index) => (
                                    <WalletCard 
                                        key={index} 
                                        item={{
                                            _id: withdrawal._id,
                                            type: 'withdrawal',
                                            title: `Withdrawal via ${withdrawal.method}`,
                                            amount: withdrawal.amount,
                                            date: withdrawal.createdAt,
                                            status: withdrawal.status,
                                            details: withdrawal.details,
                                            raw: withdrawal
                                        }} 
                                        currency={currency} 
                                        onClick={() => setSelectedWithdrawal(withdrawal)} 
                                    />
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Revenue Detail Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <BookingDetailModal 
                        booking={selectedBooking} 
                        currency={currency} 
                        onClose={() => setSelectedBooking(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Payout Detail Modal */}
            <AnimatePresence>
                {selectedWithdrawal && (
                    <WithdrawalDetailModal
                        withdrawal={selectedWithdrawal}
                        currency={currency}
                        onClose={() => setSelectedWithdrawal(null)}
                    />
                )}
            </AnimatePresence>

            {/* Withdrawal Trigger Modal */}
            <AnimatePresence>
                {showWithdrawModal && (
                    <WithdrawalModal
                        user={user}
                        currency={currency}
                        onClose={() => setShowWithdrawModal(false)}
                        onSuccess={async () => {
                            await fetchUser() // Sync wallet globally
                            await fetchWalletData() // Refresh records
                        }}
                        axios={axios}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

const EmptyState = ({ icon, message }) => (
    <div className='py-20 text-center space-y-4 bg-white rounded-2xl border border-gray-200/50 shadow-sm'>
        <div className='w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto'>
            {icon}
        </div>
        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>{message}</p>
    </div>
)

const WalletCard = ({ item, currency, onClick }) => (
    <motion.div 
        whileHover={{ x: 5 }}
        onClick={onClick}
        className='bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between gap-6 hover:border-gray-300 hover:shadow-md transition-all shadow-sm cursor-pointer group'
    >
        <div className='flex items-center gap-5'>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'revenue' && item.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : item.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                {item.type === 'revenue' && item.status === 'confirmed' ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 19V5m-7 7l7-7 7 7"/></svg>
                ) : item.type === 'withdrawal' ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14m7-7l-7 7-7-7"/></svg>
                ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                )}
            </div>
            <div>
                <h4 className='font-bold text-gray-900 text-sm'>
                    {item.title}
                </h4>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>
                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {item._id.slice(-6).toUpperCase()}
                </p>
                {item.type === 'withdrawal' && (
                    <p className='text-[9px] text-gray-500 font-semibold mt-0.5 truncate max-w-xs'>
                        To: {maskCardDetails(item.details)}
                    </p>
                )}
            </div>
        </div>
        <div className='text-right'>
            <span className={`text-base font-bold ${item.type === 'revenue' && item.status === 'confirmed' ? 'text-emerald-600' : item.type === 'withdrawal' ? 'text-rose-600' : 'text-amber-600'}`}>
                {item.type === 'revenue' && item.status === 'confirmed' ? '+' : item.type === 'withdrawal' ? '-' : ''}{item.amount?.toLocaleString()} <span className='text-[10px] font-medium'>{currency}</span>
            </span>
            <div className='flex items-center justify-end gap-1.5 mt-0.5'>
                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Completed' || item.status === 'confirmed' ? 'bg-emerald-500' : item.status === 'Pending' || item.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className='text-[8px] font-bold text-gray-400 uppercase tracking-widest'>{item.status}</span>
            </div>
        </div>
    </motion.div>
)

const BookingDetailModal = ({ booking, currency, onClose }) => {
    
    const calculateDays = (start, end) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
        return diff || 1;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] flex items-center justify-center px-6'
        >
            <div onClick={onClose} className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm' />
            
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className='bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative z-10'
            >
                <div className='p-8 pb-4 flex justify-between items-start'>
                    <div>
                        <h3 className='text-xl font-bold text-gray-900'>Revenue Details</h3>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1'>Booking ID: {booking._id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer'>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className='p-8 space-y-6'>
                    <div className='flex items-center gap-6 p-4 bg-gray-50 rounded-2xl'>
                        <img src={booking.car?.image} alt="" className='w-24 h-16 object-cover rounded-lg' />
                        <div>
                            <h4 className='font-bold text-gray-900'>{booking.car?.brand} {booking.car?.model}</h4>
                            <p className='text-xs text-gray-500 font-medium'>{booking.car?.year} • {booking.car?.category}</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-y-4'>
                        <DetailItem label="Renter Name" value={booking.user?.name || 'Customer'} />
                        <DetailItem label="Renter Email" value={booking.user?.email || 'N/A'} />
                        <DetailItem label="Rental Duration" value={`${calculateDays(booking.pickupDate, booking.returnDate)} Days`} />
                        <DetailItem label="Payment Type" value={booking.paymentMethod} />
                    </div>

                    <div className='pt-6 border-t border-gray-100 flex justify-between items-end'>
                        <div>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Net Earnings</p>
                            <h4 className='text-2xl font-black text-gray-900'>{booking.price?.toLocaleString()} <span className='text-sm font-medium text-gray-400'>{currency}</span></h4>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {booking.status === 'confirmed' ? 'Credited' : 'Pending Confirmation'}
                        </div>
                    </div>
                </div>

                <div className='p-8 pt-0'>
                    <button onClick={onClose} className='w-full py-4 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 cursor-pointer'>
                        Close Details
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

const WithdrawalDetailModal = ({ withdrawal, currency, onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] flex items-center justify-center px-6'
        >
            <div onClick={onClose} className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm' />
            
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className='bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative z-10'
            >
                <div className='p-8 pb-4 flex justify-between items-start'>
                    <div>
                        <h3 className='text-xl font-bold text-gray-900'>Withdrawal Details</h3>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1'>ID: {withdrawal._id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer'>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className='p-8 space-y-6'>
                    <div className='p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-1'>
                        <p className='text-[10px] font-bold text-rose-500 uppercase tracking-widest'>Withdrawn Amount</p>
                        <h4 className='text-3xl font-black text-rose-600'>-{withdrawal.amount?.toLocaleString()} <span className='text-sm font-semibold'>{currency}</span></h4>
                    </div>

                    <div className='grid grid-cols-2 gap-y-4'>
                        <DetailItem label="Payout Method" value={withdrawal.method} />
                        <DetailItem label="Status" value={withdrawal.status} />
                        <DetailItem label="Request Date" value={new Date(withdrawal.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                        <DetailItem label="Request Time" value={new Date(withdrawal.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
                    </div>

                    <div className='p-4 bg-gray-50 rounded-xl space-y-1 border border-gray-100'>
                        <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Destination Account Info</p>
                        <p className='text-xs font-bold text-gray-800 whitespace-pre-line leading-relaxed'>{maskCardDetails(withdrawal.details)}</p>
                    </div>
                </div>

                <div className='p-8 pt-0'>
                    <button onClick={onClose} className='w-full py-4 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 cursor-pointer'>
                        Close Details
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

const WithdrawalModal = ({ user, currency, onClose, onSuccess, axios }) => {
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('Vodafone Cash')
    const [details, setDetails] = useState('')
    const [bankName, setBankName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [validThru, setValidThru] = useState('')
    const [beneficiaryName, setBeneficiaryName] = useState('')
    const [cvv, setCvv] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleCardNumberChange = (e) => {
        let input = e.target.value.replace(/\D/g, '')
        if (input.length > 16) {
            input = input.slice(0, 16)
        }
        const matches = input.match(/\d{1,4}/g)
        setCardNumber(matches ? matches.join(' ') : '')
    }

    const handleValidThruChange = (e) => {
        let input = e.target.value.replace(/\D/g, '')
        if (input.length > 4) {
            input = input.slice(0, 4)
        }
        if (input.length > 2) {
            input = `${input.slice(0, 2)}/${input.slice(2)}`
        }
        setValidThru(input)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const numAmount = Number(amount)
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }
        if (numAmount < 100) {
            toast.error("Minimum withdrawal amount is 100 EGP")
            return
        }
        if (numAmount > 5000) {
            toast.error("Maximum withdrawal limit per transaction is 5,000 EGP")
            return
        }
        if (numAmount > user.ownerWallet) {
            toast.error(`Insufficient balance. Current balance is ${user.ownerWallet} EGP`)
            return
        }

        let finalDetails = details
        if (method === 'Bank Transfer') {
            if (!bankName.trim() || !cardNumber.trim() || !validThru.trim() || !beneficiaryName.trim() || !cvv.trim()) {
                toast.error("Please fill in all bank details")
                return
            }
            finalDetails = `${bankName} • Card: ${cardNumber.trim()} • Expiry: ${validThru.trim()} • CVV: ${cvv.trim()} • ${beneficiaryName}`
        } else {
            if (!details || details.trim() === '') {
                toast.error("Please enter payout details")
                return
            }
        }

        setSubmitting(true)
        try {
            const { data } = await axios.post('/api/user/withdraw', {
                amount: numAmount,
                method,
                details: finalDetails,
                walletType: 'owner'
            })
            if (data.success) {
                toast.success(data.message || "Withdrawal completed successfully!")
                onSuccess()
                onClose()
            } else {
                toast.error(data.message || "Withdrawal failed")
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] flex items-center justify-center px-6'
        >
            <div onClick={onClose} className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm' />
            
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className='bg-white w-full max-w-md rounded-[2rem] shadow-2xl max-h-[85vh] overflow-y-auto relative z-10 p-8 space-y-6'
            >
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='text-xl font-extrabold text-gray-900 tracking-tight'>Withdraw Funds</h3>
                        <p className='text-xs text-gray-500 mt-1 font-medium'>Securely payout your earnings.</p>
                    </div>
                    <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer'>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div className='p-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex justify-between items-center text-white shadow-md relative overflow-hidden'>
                        <div className='space-y-0.5 z-10'>
                            <span className='text-[9px] font-black uppercase tracking-widest text-emerald-100'>Your Balance</span>
                            <h4 className='text-2xl font-black tracking-tight'>{user.ownerWallet?.toLocaleString()} <span className='text-xs font-medium text-emerald-100'>{currency}</span></h4>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Amount (EGP)</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Min: 100 | Max: 5,000"
                            className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 font-mono'
                            min="100"
                            max="5000"
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Payout Method</label>
                        <div className='grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200/50'>
                            {['Vodafone Cash', 'InstaPay', 'Bank Transfer'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                        setMethod(m)
                                        setDetails('')
                                    }}
                                    className={`py-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${method === m ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <span>{m.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {method === 'Bank Transfer' ? (
                        <div className='space-y-3.5'>
                            <input 
                                type="text"
                                value={bankName}
                                onChange={e => setBankName(e.target.value)}
                                placeholder="Bank Name (e.g. CIB, QNB)"
                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-emerald-500 outline-none transition-all'
                                required
                            />
                            <input 
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="Card Number (16 Digits)"
                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono'
                                required
                            />
                            <div className='grid grid-cols-2 gap-4'>
                                <input 
                                    type="text"
                                    value={validThru}
                                    onChange={handleValidThruChange}
                                    placeholder="MM/YY"
                                    className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono'
                                    required
                                />
                                <input 
                                    type="password"
                                    value={cvv}
                                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="CVV"
                                    className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono'
                                    required
                                />
                            </div>
                            <input 
                                type="text"
                                value={beneficiaryName}
                                onChange={e => setBeneficiaryName(e.target.value)}
                                placeholder="Beneficiary Full Name"
                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-emerald-500 outline-none transition-all'
                                required
                            />
                        </div>
                    ) : (
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>
                                {method === 'Vodafone Cash' ? 'Vodafone Mobile Number' : 'InstaPay Address (IPA)'}
                            </label>
                            <input 
                                type="text"
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                placeholder={method === 'Vodafone Cash' ? 'e.g. 01012345678' : 'e.g. username@instapay'}
                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono'
                                required
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className='w-full py-4 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50'
                    >
                        {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

const DetailItem = ({ label, value }) => (
    <div>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{label}</p>
        <p className='text-sm font-semibold text-gray-900 mt-0.5'>{value}</p>
    </div>
)

export default OwnerWallet
