import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'

const maskCardDetails = (details) => {
    if (!details) return ''
    return details
        .replace(/CVV:\s*\d+/gi, 'CVV: ***')
        .replace(/Card:\s*\d[\d\s]{10,18}\d/gi, (match) => {
            const digits = match.replace(/\D/g, '')
            return 'Card: •••• •••• •••• ' + digits.slice(-4)
        })
}

const showMinBalanceToast = (balance) => {
    toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black/5 p-5 border border-rose-50/80`}
        >
            <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                    <h4 className="text-sm font-black text-gray-900 tracking-tight">Withdrawal Restricted</h4>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Required: 1,000 EGP</p>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed pt-1">
                        A minimum balance of 1,000 EGP is required to request a payout. Your current balance is {balance?.toLocaleString()} EGP.
                    </p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-full shrink-0 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        </div>
    ), { id: 'min-balance-error', duration: 4000 });
};

const showDailyLimitToast = () => {
    toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black/5 p-5 border border-rose-50/80`}
        >
            <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                    <h4 className="text-sm font-black text-gray-900 tracking-tight">Withdrawal Limit Reached</h4>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Limit: 1 Payout / Day</p>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed pt-1">
                        You can only make one withdrawal request per day. Please try again tomorrow.
                    </p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-full shrink-0 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        </div>
    ), { id: 'daily-limit-error', duration: 4000 });
};

const Wallet = () => {
    const { user, currency, axios, fetchUser } = useAppContext()
    const [bookings, setBookings] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('history') // 'history' or 'upcoming'
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)

    const fetchWalletData = async () => {
        try {
            const [bookingsRes, withdrawalsRes] = await Promise.all([
                axios.get('/api/bookings/user'),
                axios.get('/api/user/withdrawals?walletType=renter')
            ])
            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.bookings)
            }
            if (withdrawalsRes.data.success) {
                setWithdrawals(withdrawalsRes.data.withdrawals)
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

    // 1. Transaction History: All bookings that were rejected or cancelled (Refunds)
    const historyBookings = bookings.filter(b => ['rejected', 'cancelled'].includes(b.status))
    
    // 2. Wallet Bookings: All bookings paid using the wallet funds
    const walletPaidBookings = bookings.filter(b => b.paymentMethod === 'Wallet')

    // Combine history: refunds + withdrawals, sorted by date descending
    const combinedHistory = [
        ...historyBookings.map(b => ({
            _id: b._id,
            type: 'refund',
            title: `Refund: ${b.status === 'rejected' ? 'Rejected Booking' : 'Cancelled Booking'}`,
            amount: b.price,
            date: b.createdAt,
            status: b.status,
            raw: b
        })),
        ...withdrawals.map(w => ({
            _id: w._id,
            type: 'withdrawal',
            title: `Withdrawal via ${w.method}`,
            amount: w.amount,
            date: w.createdAt,
            status: w.status,
            details: w.details,
            raw: w
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))

    const handleWithdrawClick = () => {
        if (user.wallet < 1000) {
            showMinBalanceToast(user.wallet);
            return;
        }
        const hasWithdrawnToday = withdrawals.some(w => {
            if (w.status === 'Failed') return false;
            const diff = Date.now() - new Date(w.createdAt).getTime();
            return diff < 24 * 60 * 60 * 1000;
        });
        if (hasWithdrawnToday) {
            showDailyLimitToast();
            return;
        }
        setShowWithdrawModal(true);
    };

    return (
        <div className='min-h-screen bg-gray-50 py-12 md:py-20 relative'>
            <div className='max-w-5xl mx-auto px-6'>
                
                {/* Page Title */}
                <div className='mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>My Wallet</h1>
                        <p className='text-gray-500 mt-1 font-medium'>Manage your funds and track transaction history.</p>
                    </div>
                    {/* Withdraw Button */}
                    <button
                        onClick={handleWithdrawClick}
                        className='px-6 py-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer'
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4-4m0 0l-4-4m4 4H3m14 4h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h2"/></svg>
                        Withdraw Funds
                    </button>
                </div>

                {/* Professional Wallet Hero Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden'
                >
                    <div className='flex flex-col md:flex-row justify-between items-center gap-10'>
                        <div className='space-y-3 text-center md:text-left z-10'>
                            <div className='flex items-center justify-center md:justify-start gap-2 text-primary font-bold'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                                <span className='text-[10px] uppercase tracking-widest'>Current Balance</span>
                            </div>
                            <h2 className='text-5xl font-bold text-gray-900 tracking-tight'>
                                {user.wallet?.toLocaleString()} <span className='text-xl text-gray-400 font-medium'>{currency}</span>
                            </h2>
                        </div>

                        {/* Decorative Professional Element */}
                        <div className='hidden md:block absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-[0.03] overflow-hidden'>
                            <svg className='w-full h-full' viewBox="0 0 400 200" preserveAspectRatio="none">
                                <path d="M0,150 Q50,140 100,100 T200,80 T300,120 T400,20" fill="none" stroke="#000" strokeWidth="40" strokeLinecap="round" />
                                <path d="M0,180 Q60,170 120,130 T240,110 T360,150 T400,50" fill="none" stroke="#000" strokeWidth="20" strokeLinecap="round" />
                            </svg>
                        </div>
                        
                        <div className='hidden md:flex flex-col items-end gap-2 text-right z-10'>
                             <div className='flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100'>
                                <span className='w-1 h-1 rounded-full bg-green-500 animate-pulse' />
                                <span className='text-[9px] font-bold uppercase tracking-widest'>Secure Assets</span>
                             </div>
                             <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Real-time Syncing</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className='flex items-center gap-10 mb-10 border-b border-gray-200'>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Transaction History
                        {activeTab === 'history' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'upcoming' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Wallet Bookings
                        {activeTab === 'upcoming' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
                    </button>
                </div>

                {/* Content Area */}
                <AnimatePresence mode='wait'>
                    {activeTab === 'history' ? (
                        <motion.div 
                            key="history"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='space-y-3'
                        >
                            {combinedHistory.length === 0 ? (
                                <EmptyState icon={<svg className='text-gray-200' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>} message="No transaction history found" />
                            ) : (
                                combinedHistory.map((item, index) => (
                                    <WalletCard 
                                        key={index} 
                                        item={item} 
                                        currency={currency} 
                                        onClick={() => {
                                            if (item.type === 'refund') {
                                                setSelectedBooking(item.raw)
                                            } else {
                                                setSelectedWithdrawal(item.raw)
                                            }
                                        }} 
                                    />
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="upcoming"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='space-y-3'
                        >
                            {walletPaidBookings.length === 0 ? (
                                <EmptyState icon={<svg className='text-gray-200' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>} message="No bookings paid with wallet found" />
                            ) : (
                                walletPaidBookings.map((booking, index) => (
                                    <WalletCard 
                                        key={index} 
                                        item={{
                                            _id: booking._id,
                                            type: 'expense',
                                            title: `${booking.car?.brand} ${booking.car?.model}`,
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
                    )}
                </AnimatePresence>

            </div>

            {/* Refund Detail Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <BookingDetailModal 
                        booking={selectedBooking} 
                        currency={currency} 
                        onClose={() => setSelectedBooking(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Withdrawal Detail Modal */}
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
                        withdrawals={withdrawals}
                        currency={currency}
                        onClose={() => setShowWithdrawModal(false)}
                        onSuccess={async () => {
                            await fetchUser() // Updates balance globally
                            await fetchWalletData() // Refresh booking and withdrawal history
                        }}
                        axios={axios}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

const EmptyState = ({ icon, message }) => (
    <div className='py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100'>
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
        className='bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between gap-6 hover:border-gray-300 transition-all shadow-sm cursor-pointer group'
    >
        <div className='flex items-center gap-5'>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'refund' ? 'bg-green-50 text-green-600' : item.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' : 'bg-primary/5 text-primary'}`}>
                {item.type === 'refund' ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 19V5m-7 7l7-7 7 7"/></svg>
                ) : item.type === 'withdrawal' ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14m7-7l-7 7-7-7"/></svg>
                ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14m7-7l-7 7-7-7"/></svg>
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
            <span className={`text-base font-bold ${item.type === 'refund' ? 'text-green-600' : 'text-gray-900'}`}>
                {item.type === 'refund' ? '+' : '-'}{item.amount?.toLocaleString()} <span className='text-[10px] font-medium'>{currency}</span>
            </span>
            <div className='flex items-center justify-end gap-1.5 mt-0.5'>
                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Completed' || item.status === 'confirmed' ? 'bg-green-500' : item.status === 'Pending' || item.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
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
                {/* Modal Header */}
                <div className='p-8 pb-4 flex justify-between items-start'>
                    <div>
                        <h3 className='text-xl font-bold text-gray-900'>Booking Details</h3>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1'>ID: {booking._id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400'>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className='p-8 space-y-8'>
                    {/* Car Preview */}
                    <div className='flex items-center gap-6 p-4 bg-gray-50 rounded-2xl'>
                        <img src={booking.car?.image} alt="" className='w-24 h-16 object-cover rounded-lg' />
                        <div>
                            <h4 className='font-bold text-gray-900'>{booking.car?.brand} {booking.car?.model}</h4>
                            <p className='text-xs text-gray-500 font-medium'>{booking.car?.year} • {booking.car?.category}</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className='grid grid-cols-2 gap-y-6'>
                        <DetailItem label="Pickup Date" value={new Date(booking.pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                        <DetailItem label="Return Date" value={new Date(booking.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                        <DetailItem label="Duration" value={`${calculateDays(booking.pickupDate, booking.returnDate)} Days`} />
                        <DetailItem label="Payment Method" value={booking.paymentMethod} />
                    </div>

                    {/* Summary */}
                    <div className='pt-8 border-t border-gray-100 flex justify-between items-end'>
                        <div>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Total Amount</p>
                            <h4 className='text-2xl font-black text-gray-900'>{booking.price?.toLocaleString()} <span className='text-sm font-medium text-gray-400'>{currency}</span></h4>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                            {booking.status}
                        </div>
                    </div>
                </div>

                <div className='p-8 pt-0'>
                    <button onClick={onClose} className='w-full py-4 bg-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer'>
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
                {/* Modal Header */}
                <div className='p-8 pb-4 flex justify-between items-start'>
                    <div>
                        <h3 className='text-xl font-bold text-gray-900'>Withdrawal Details</h3>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1'>ID: {withdrawal._id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400'>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className='p-8 space-y-8'>
                    {/* Cashout Amount */}
                    <div className='p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-1'>
                        <p className='text-[10px] font-bold text-rose-500 uppercase tracking-widest'>Withdrawn Amount</p>
                        <h4 className='text-3xl font-black text-rose-600'>-{withdrawal.amount?.toLocaleString()} <span className='text-sm font-semibold'>{currency}</span></h4>
                    </div>

                    {/* Info Grid */}
                    <div className='grid grid-cols-2 gap-y-6'>
                        <DetailItem label="Payout Method" value={withdrawal.method} />
                        <DetailItem label="Status" value={withdrawal.status} />
                        <DetailItem label="Request Date" value={new Date(withdrawal.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                        <DetailItem label="Request Time" value={new Date(withdrawal.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
                    </div>

                    {/* Details section */}
                    <div className='p-4 bg-gray-50 rounded-2xl space-y-1 border border-gray-100'>
                        <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Destination Account Info</p>
                        <p className='text-xs font-bold text-gray-800 whitespace-pre-line leading-relaxed'>{maskCardDetails(withdrawal.details)}</p>
                    </div>
                </div>

                <div className='p-8 pt-0'>
                    <button onClick={onClose} className='w-full py-4 bg-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer'>
                        Close Details
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

const WithdrawalModal = ({ user, withdrawals, currency, onClose, onSuccess, axios }) => {
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
        if (user.wallet < 1000) {
            showMinBalanceToast(user.wallet)
            return
        }
        const hasWithdrawnToday = withdrawals.some(w => {
            if (w.status === 'Failed') return false;
            const diff = Date.now() - new Date(w.createdAt).getTime();
            return diff < 24 * 60 * 60 * 1000;
        });
        if (hasWithdrawnToday) {
            showDailyLimitToast()
            return
        }
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
        if (numAmount > user.wallet) {
            toast.error(`Insufficient balance. Current balance is ${user.wallet} EGP`)
            return
        }

        let finalDetails = details
        if (method === 'Bank Transfer') {
            if (!bankName.trim() || !cardNumber.trim() || !validThru.trim() || !beneficiaryName.trim() || !cvv.trim()) {
                toast.error("Please fill in all bank details including card information")
                return
            }
            if (cardNumber.replace(/\s/g, '').length < 12 || cardNumber.replace(/\s/g, '').length > 19) {
                toast.error("Please enter a valid Card Number")
                return
            }
            if (!/^\d{2}\/\d{2}$/.test(validThru)) {
                toast.error("Please enter a valid expiry date (MM/YY)")
                return
            }
            const month = parseInt(validThru.split('/')[0])
            if (month < 1 || month > 12) {
                toast.error("Expiry month must be between 01 and 12")
                return
            }
            if (cvv.trim().length < 3 || cvv.trim().length > 4) {
                toast.error("Security code (CVV) must be 3 or 4 digits")
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
                walletType: 'renter'
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
                className='bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 space-y-6'
            >
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='text-xl font-extrabold text-gray-900 tracking-tight'>Withdraw Funds</h3>
                        <p className='text-xs text-gray-500 mt-1 font-medium'>Securely transfer cash from your wallet.</p>
                    </div>
                    <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer'>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Modern Gradient Balance Card */}
                    <div className='p-5 bg-gradient-to-r from-primary to-emerald-600 rounded-2xl flex justify-between items-center text-white shadow-lg shadow-primary/10 relative overflow-hidden'>
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <circle cx="80" cy="50" r="40" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className='space-y-0.5 z-10'>
                            <span className='text-[9px] font-black uppercase tracking-widest text-emerald-100'>Your Balance</span>
                            <h4 className='text-2xl font-black tracking-tight'>{user.wallet?.toLocaleString()} <span className='text-xs font-medium text-emerald-100'>{currency}</span></h4>
                        </div>
                        <div className='flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-xl border border-white/10 z-10'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse' />
                            <span className='text-[8px] font-black uppercase tracking-wider text-emerald-50'>Active Wallet</span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className='space-y-2'>
                        <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Amount (EGP)</label>
                        <div className='relative'>
                            <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-1.937-.5-.976-.56-.976-1.467 0-2.027 1.171-.879 3.07-.879 4.242 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Min: 100 | Max: 5,000"
                                className='w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400 font-mono'
                                min="100"
                                max="5000"
                                required
                            />
                            <span className='absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs'>{currency}</span>
                        </div>
                        
                        {/* Quick Amount Pills */}
                        <div className='flex gap-2 mt-2'>
                            {[500, 1000, 2000, 5000].map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => {
                                        if (user.wallet >= amt) {
                                            setAmount(amt.toString())
                                        } else {
                                            toast.error(`Your balance is less than ${amt} EGP`)
                                        }
                                    }}
                                    className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${Number(amount) === amt ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'}`}
                                >
                                    {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Segmented Payout Tabs */}
                    <div className='space-y-2'>
                        <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Payout Method</label>
                        <div className='grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100'>
                            {['Vodafone Cash', 'InstaPay', 'Bank Transfer'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                        setMethod(m)
                                        setDetails('')
                                        setBankName('')
                                        setCardNumber('')
                                        setValidThru('')
                                        setBeneficiaryName('')
                                        setCvv('')
                                    }}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${method === m ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {m === 'Vodafone Cash' && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3M9 18h6"/></svg>}
                                    {m === 'InstaPay' && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"/></svg>}
                                    {m === 'Bank Transfer' && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 21V10.5m0 10.5H8.25m3.75 0h3.75m-7.5 0h-3M12 10.5h3.75m-7.5 0H3m9-8.25L3 10.5h18L12 2.25zM6 10.5v10.5m12-10.5v10.5m-6-10.5v10.5"/></svg>}
                                    <span className="scale-[0.9]">{m.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Destination details input */}
                    {method === 'Bank Transfer' ? (
                        <div className='space-y-4'>
                            {/* Bank Name */}
                            <div className='space-y-1.5'>
                                <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Bank Name</label>
                                <div className='relative'>
                                    <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 21V10.5m0 10.5H8.25m3.75 0h3.75m-7.5 0h-3M12 10.5h3.75m-7.5 0H3m9-8.25L3 10.5h18L12 2.25zM6 10.5v10.5m12-10.5v10.5m-6-10.5v10.5"/></svg>
                                    </div>
                                    <input 
                                        type="text"
                                        value={bankName}
                                        onChange={e => setBankName(e.target.value)}
                                        placeholder="e.g. CIB, QNB, HSBC"
                                        className='w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400'
                                        required={method === 'Bank Transfer'}
                                    />
                                </div>
                            </div>

                            {/* Card Number */}
                            <div className='space-y-1.5'>
                                <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Card Number</label>
                                <div className='relative'>
                                    <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 3h3m-6-11.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3z" /></svg>
                                    </div>
                                    <input 
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        placeholder="0000 0000 0000 0000"
                                        className='w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400 font-mono'
                                        required={method === 'Bank Transfer'}
                                    />
                                </div>
                            </div>

                            {/* Valid Thru and CVV Side-by-Side */}
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Valid Thru */}
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Valid Thru</label>
                                    <div className='relative'>
                                        <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                        </div>
                                        <input 
                                            type="text"
                                            value={validThru}
                                            onChange={handleValidThruChange}
                                            placeholder="MM/YY"
                                            className='w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400 font-mono'
                                            required={method === 'Bank Transfer'}
                                        />
                                    </div>
                                </div>

                                {/* Card Security Code (CVV) */}
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>CVV</label>
                                    <div className='relative'>
                                        <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
                                        </div>
                                        <input 
                                            type="password"
                                            value={cvv}
                                            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="123"
                                            maxLength="4"
                                            className='w-full pl-12 pr-3 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400 font-mono'
                                            required={method === 'Bank Transfer'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Beneficiary Name */}
                            <div className='space-y-1.5'>
                                <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>Beneficiary Full Name</label>
                                <div className='relative'>
                                    <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7 0 3.75 3.75 0 017 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                                    </div>
                                    <input 
                                        type="text"
                                        value={beneficiaryName}
                                        onChange={e => setBeneficiaryName(e.target.value)}
                                        placeholder="Full name as registered in bank"
                                        className='w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400'
                                        required={method === 'Bank Transfer'}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>
                                {method === 'Vodafone Cash' ? 'Mobile Number' : 'InstaPay Address (IPA)'}
                            </label>
                            <div className='relative'>
                                <div className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400'>
                                    {method === 'Vodafone Cash' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3M9 18h6"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"/></svg>
                                    )}
                                </div>
                                <input 
                                    type="text"
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    placeholder={method === 'Vodafone Cash' ? 'e.g. 01012345678' : 'e.g. name@instapay'}
                                    className='w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary outline-none transition-all placeholder:text-gray-400'
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className='w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0'
                    >
                        {submitting ? (
                            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                        ) : 'Confirm Withdrawal'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

const DetailItem = ({ label, value }) => (
    <div className='space-y-1'>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{label}</p>
        <p className='text-sm font-bold text-gray-900'>{value}</p>
    </div>
)

export default Wallet

