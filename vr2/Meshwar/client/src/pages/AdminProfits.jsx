import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const AdminProfits = () => {
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ balance: 0, bookings: [] });
  const [commissionRate, setCommissionRate] = useState(0.10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profitsRes, settingsRes] = await Promise.all([
        axios.get('/api/admin/profits', { headers: { Authorization: sessionStorage.getItem('adminToken') } }),
        axios.get('/api/admin/settings', { headers: { Authorization: sessionStorage.getItem('adminToken') } })
      ]);

      if (profitsRes.data.success) {
        setData({
          balance: profitsRes.data.balance || 0,
          bookings: profitsRes.data.bookings || []
        });
      }
      if (settingsRes.data.success) {
        setCommissionRate(settingsRes.data.settings?.commissionRate ?? 0.10);
      }
    } catch (error) {
      toast.error('Failed to load profits data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Revenues</h1>
        <p className="text-gray-500 mt-2">Overview of platform earnings and commission history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-green-100 font-medium tracking-wider uppercase text-sm mb-2">Total Accumulated Profits</p>
            <h2 className="text-5xl font-extrabold">{data.balance} <span className="text-2xl font-semibold opacity-80">EGP</span></h2>
            <p className="mt-4 text-sm text-green-50 bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
              Platform Revenues (Taxes and Fees)
            </p>
          </div>
          <svg className="absolute right-0 bottom-0 w-48 h-48 text-white opacity-10 translate-x-8 translate-y-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Current Commission Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">{(commissionRate * 100).toFixed(0)}%</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            This percentage is automatically deducted from each verified rental handover.
          </p>
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Recent Commission Transactions</h3>
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
            {data.bookings.length} Transactions
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trx ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Renter</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-green-600 uppercase tracking-wider bg-green-50/30">Platform Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.bookings.length > 0 ? data.bookings.map((booking) => {
                const totalAmount = booking.price || 0;
                const estimatedProfit = Math.round(totalAmount * commissionRate);
                const carDisplay = booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Unknown Car';
                
                return (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      #{booking._id.substring(booking._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(booking.handoverVerifiedAt || booking.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(booking.handoverVerifiedAt || booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {booking.car?.image && (
                          <img src={booking.car.image} alt={carDisplay} className="w-10 h-10 rounded object-cover shadow-sm" />
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">{carDisplay}</div>
                          {booking.car?.year && <div className="text-xs text-gray-500 font-medium">{booking.car.year}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{booking.user?.name || booking.user?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{booking.owner?.name || booking.owner?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{booking.owner?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{totalAmount.toLocaleString()} EGP</div>
                      <div className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">Booking Total</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap bg-green-50/30">
                      <div className="text-sm font-black text-green-600">+{estimatedProfit.toLocaleString()} EGP</div>
                      <div className="text-[10px] text-green-600/70 font-semibold mt-0.5">{(commissionRate * 100).toFixed(0)}% CUT</div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No commission transactions found yet.</p>
                      <p className="text-xs mt-1 text-gray-400">Profits will appear here once rentals are verified.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProfits;
