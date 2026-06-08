import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const AdminPendingFinances = () => {
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ totalHeldFunds: 0, bookings: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/pending-finances', { headers: { Authorization: sessionStorage.getItem('adminToken') } });
      
      if (res.data.success) {
        setData({
          totalHeldFunds: res.data.totalHeldFunds || 0,
          bookings: res.data.bookings || []
        });
      } else {
        toast.error(res.data.message || 'Failed to load pending finances');
      }
    } catch (error) {
      toast.error('Failed to load pending finances');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Finances</h1>
        <p className="text-gray-500 mt-2">Overview of funds held by the platform for bookings that haven't been verified yet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500 to-amber-600 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-yellow-100 font-medium tracking-wider uppercase text-sm mb-2">Total Held Funds</p>
            <h2 className="text-5xl font-extrabold">{data.totalHeldFunds.toLocaleString()} <span className="text-2xl font-semibold opacity-80">EGP</span></h2>
            <p className="mt-4 text-sm text-yellow-50 bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
              Waiting for handover verification
            </p>
          </div>
          <svg className="absolute right-0 bottom-0 w-48 h-48 text-white opacity-10 translate-x-8 translate-y-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">How it works</p>
              <h3 className="text-xl font-bold text-gray-900">Held in Escrow</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            When a user books a car, their payment is held by the platform. Once the car owner verifies the handover using the PIN, the funds are automatically split between the owner's wallet and platform revenues.
          </p>
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Pending Transactions</h3>
          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-semibold">
            {data.bookings.length} Pending
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trx ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Renter</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.bookings.length > 0 ? data.bookings.map((booking) => {
                const totalAmount = booking.price || 0;
                const carDisplay = booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Unknown Car';
                
                return (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      #{booking._id.substring(booking._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
                      <div className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">Held Funds</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No pending finances found.</p>
                      <p className="text-xs mt-1 text-gray-400">All bookings have either been verified or there are no active bookings.</p>
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

export default AdminPendingFinances;
