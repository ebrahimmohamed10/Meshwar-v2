import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

const AdminTotalBookings = () => {
  const { adminToken } = useOutletContext() || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (adminToken) {
      fetchBookings();
    }
  }, [adminToken]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/admin/bookings', {
        headers: { Authorization: adminToken }
      });
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      toast.error("Failed to load platform bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this booking? This will override owner/user actions.");
    if (isConfirmed) {
      try {
        const response = await axios.post(`/api/admin/bookings/${id}/cancel`, {}, {
          headers: { Authorization: adminToken }
        });
        if (response.data.success) {
          toast.success("Booking cancelled by admin");
          fetchBookings();
        } else {
          toast.error(response.data.message || "Failed to cancel booking");
        }
      } catch (error) {
        console.error("Failed to cancel booking", error);
        toast.error("Failed to cancel booking.");
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = (b.car?.brand?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b._id.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 ring-1 ring-green-600/20';
      case 'pending': return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-600/20';
      case 'cancelled': return 'bg-red-100 text-red-700 ring-1 ring-red-600/20';
      default: return 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20';
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Total Bookings</h1>
          <p className="text-gray-500 mt-1">Monitor and moderate all reservations across the Meshwar platform.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm flex gap-8">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Volume</p>
            <p className="text-xl font-black text-gray-900">{bookings.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Revenue Flow</p>
            <p className="text-xl font-black text-green-600">
              {bookings.reduce((sum, b) => b.status === 'confirmed' ? sum + b.price : sum, 0).toLocaleString()} EGP
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search car, user or ID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full sm:w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full sm:w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID & Car</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car Owner</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rental Period</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Price</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Locations</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-400">Loading platform transactions...</td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-400 italic">No bookings found matching your search.</td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={b._id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="text-[10px] font-mono text-gray-400 uppercase mb-1">#{b._id.substring(b._id.length-8)}</div>
                      <div className="font-bold text-gray-900">{b.car?.brand} {b.car?.model}</div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-tighter">Category: {b.car?.category || 'Sedan'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-bold text-sm uppercase">{b.owner?.name || 'Meshwar'}</div>
                      <div className="text-[10px] text-gray-400">{b.owner?.email || 'admin@meshwar.com'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-medium text-sm">{b.user?.name || 'Deleted User'}</div>
                      <div className="text-[11px] text-gray-500">{b.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-800">
                          <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-tighter">Pick-up</span>
                          {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-800">
                          <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-tighter">Return</span>
                          {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-[11px] font-bold text-gray-900 mt-1 border-t pt-1 flex items-center justify-between">
                          <span className="text-gray-400 font-normal">Duration:</span>
                          {b.pickupDate && b.returnDate ? Math.ceil((new Date(b.returnDate) - new Date(b.pickupDate)) / (1000 * 60 * 60 * 24)) : 0} Days
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                      {b.price.toLocaleString()} EGP
                    </td>
                    <td className="py-4 px-6">
                      {b.pickupLocation ? (
                        <div className="space-y-1 min-w-[140px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter font-bold">Pick-up</span>
                            <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{b.pickupLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter font-bold">Return</span>
                            <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{b.returnLocation || b.pickupLocation}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not specified</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelBooking(b._id)}
                          className="text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-widest p-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTotalBookings;
