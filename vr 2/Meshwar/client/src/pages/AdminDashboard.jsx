import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const DashboardIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const UsersIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-3.812" /></svg>);
const CarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
const BookingIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>);
const SettingsIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalCars: 0, totalBookings: 0, totalRevenue: 0, monthlyRevenue: 0, recentBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const filteredBookings = stats.recentBookings?.filter((booking) => {
    const matchesSearch = booking._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleOpenModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
      isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col">
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"/>
            <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full ring-2 ring-white bg-green-500" />
          </div>
          <h2 className="text-xl font-semibold mt-3 text-gray-800">Admin</h2>
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium uppercase mt-1">Super Admin</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">MAIN MENU</p>
          
          <NavLink to="/admin" end className={navLinkClass}>
            <DashboardIcon /><span>Overview</span>
          </NavLink>
          
          <NavLink to="/admin/users" className={navLinkClass}>
            <UsersIcon /><span>Manage Users</span>
          </NavLink>
          
          <NavLink to="/admin/cars" className={navLinkClass}>
            <CarIcon /><span>Manage All Cars</span>
          </NavLink>
          
          <NavLink to="/admin/bookings" className={navLinkClass}>
            <BookingIcon /><span>Total Bookings</span>
          </NavLink>
          
          <NavLink to="/admin/settings" className={navLinkClass}>
            <SettingsIcon /><span>System Settings</span>
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">MESH<span className="text-gray-800">WAR</span></span>
          <div className="text-sm text-gray-600">Welcome, <span className="font-medium text-gray-800">Admin</span></div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor overall platform performance, users, and global revenue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
              <div><p className="text-sm text-gray-500">Total System Users</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.totalUsers}</p></div>
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><UsersIcon /></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
              <div><p className="text-sm text-gray-500">Total Cars Listed</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.totalCars}</p></div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><CarIcon /></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
              <div><p className="text-sm text-gray-500">Global Bookings</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.totalBookings}</p></div>
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center"><BookingIcon /></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
              <div><p className="text-sm text-gray-500">Platform Revenue</p><p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : (stats.totalRevenue).toLocaleString()}</p></div>
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl">$</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Global Bookings</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input type="text" placeholder="Search ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-48 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"/>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-36 px-3 py-2 border rounded-lg text-sm">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Booking ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">#{booking._id?.substring(0, 6)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{booking.price?.toLocaleString()} EGP</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleOpenModal(booking)} className="text-green-600 hover:text-green-800 font-medium">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Financials</h3>
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4 text-3xl font-bold">$</div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">MONTHLY EARNINGS</p>
                <p className="text-5xl font-extrabold text-gray-900 mt-2 mb-2">{loading ? '...' : (stats.monthlyRevenue || 0).toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-700">EGP</p>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Booking Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Booking ID</p>
                  <p className="font-semibold text-gray-900">#{selectedBooking._id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Status</p>
                  <p className="font-semibold text-green-600 uppercase">{selectedBooking.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Car Model</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.car?.make} {selectedBooking.car?.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Plate Number</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.car?.plateNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2 border-t pt-4"></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.user?.fullName || selectedBooking.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Customer Phone</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Owner</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.owner?.fullName || selectedBooking.owner?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Owner Phone</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.owner?.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2 border-t pt-4"></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Amount</p>
                  <p className="text-xl font-bold text-gray-900">{selectedBooking.price?.toLocaleString()} EGP</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Payment</p>
                  <p className="font-semibold text-gray-900 uppercase">{selectedBooking.paymentMethod}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;