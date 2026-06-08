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
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
                    <td 
                      className="py-4 px-6 cursor-pointer hover:bg-green-50/50 rounded-lg group"
                      onClick={() => {
                        if(b.user) {
                          setSelectedUser(b.user);
                          setIsUserModalOpen(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {b.user && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 hidden sm:block">
                            {b.user.image ? (
                              <img src={b.user.image} alt={b.user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 font-bold text-xs">
                                {(b.user.name || b.user.fullName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <div className="text-green-600 group-hover:text-green-700 font-bold text-sm transition-colors">{b.user?.name || b.user?.fullName || 'Deleted User'}</div>
                          <div className="text-[11px] text-gray-500">{b.user?.email || 'N/A'}</div>
                        </div>
                      </div>
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

      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
          >
            <div className="absolute top-4 right-4">
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden shadow-md border-4 border-white ring-2 ring-gray-100">
                  {selectedUser.image ? (
                    <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-3xl">
                      {(selectedUser.name || selectedUser.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name || selectedUser.fullName}</h3>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full mt-2">
                  Customer Profile
                </span>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Email Address</p>
                    <p className="font-semibold text-sm text-gray-900 truncate">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Phone Number</p>
                    <p className="font-semibold text-sm text-gray-900">{selectedUser.phone || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Address</p>
                    <p className="font-semibold text-sm text-gray-900">{selectedUser.address && selectedUser.address !== 'Not Selected' ? `${selectedUser.address}, ${selectedUser.city}, ${selectedUser.country}` : 'Not Provided'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Date of Birth</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedUser.dob && selectedUser.dob !== 'Not Selected' ? selectedUser.dob : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Gender</p>
                      <p className="font-semibold text-sm text-gray-900 capitalize">{selectedUser.gender && selectedUser.gender !== 'Not Selected' ? selectedUser.gender : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">National ID</p>
                      <p className="font-semibold text-sm text-gray-900 truncate">{selectedUser.idNumber && selectedUser.idNumber !== 'Not Selected' ? selectedUser.idNumber : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">License No.</p>
                      <p className="font-semibold text-sm text-gray-900 truncate">{selectedUser.licenseNumber && selectedUser.licenseNumber !== 'Not Selected' ? selectedUser.licenseNumber : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Joined Date</p>
                    <p className="font-semibold text-sm text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 px-1">Verification Assets</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative group flex flex-col items-center justify-center">
                      {selectedUser.idCardFront ? (
                        <a href={selectedUser.idCardFront} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                          <img src={selectedUser.idCardFront} alt="ID Front" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No ID Front</span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm p-1.5 text-center">
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider">ID Front</span>
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative group flex flex-col items-center justify-center">
                      {selectedUser.idCardBack ? (
                        <a href={selectedUser.idCardBack} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                          <img src={selectedUser.idCardBack} alt="ID Back" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No ID Back</span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm p-1.5 text-center">
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider">ID Back</span>
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative group flex flex-col items-center justify-center">
                      {selectedUser.licenseFront ? (
                        <a href={selectedUser.licenseFront} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                          <img src={selectedUser.licenseFront} alt="License Front" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No License Front</span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm p-1.5 text-center">
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider">License Front</span>
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative group flex flex-col items-center justify-center">
                      {selectedUser.licenseBack ? (
                        <a href={selectedUser.licenseBack} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                          <img src={selectedUser.licenseBack} alt="License Back" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No License Back</span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm p-1.5 text-center">
                        <span className="text-[9px] text-white font-bold uppercase tracking-wider">License Back</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTotalBookings;
