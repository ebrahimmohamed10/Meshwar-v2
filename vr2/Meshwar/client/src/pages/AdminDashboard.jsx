import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext, NavLink } from 'react-router-dom';
import { motion } from 'motion/react';

const UsersIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-3.812" /></svg>);
const CarIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
const BookingIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>);
const RevenueIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.93 4.93l14.14 14.14" /></svg>);

const AdminDashboard = () => {
  const { adminUser } = useOutletContext() || {};
  const [stats, setStats] = useState({
    totalUsers: 0, totalCars: 0, totalBookings: 0, totalRevenue: 0, monthlyRevenue: 0, recentBookings: []
  });
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Real-time statistics and global performance metrics for Meshwar.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<UsersIcon />} color="blue" loading={loading} />
        <StatCard title="Total Inventory" value={stats.totalCars} icon={<CarIcon />} color="indigo" loading={loading} />
        <StatCard title="Global Bookings" value={stats.totalBookings} icon={<BookingIcon />} color="amber" loading={loading} />
        <StatCard title="Total Revenue" value={stats.totalRevenue.toLocaleString() + ' EGP'} icon={<RevenueIcon />} color="emerald" loading={loading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Transactions Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Transactions</h3>
            <NavLink to="/admin/bookings" className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-widest">View All Bookings &rarr;</NavLink>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Booking / Car</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20"></div></td>
                    </tr>
                  ))
                ) : stats.recentBookings.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No recent transactions.</td></tr>
                ) : (
                  stats.recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-mono text-gray-400 mb-1">#{b._id.substring(b._id.length-6)}</div>
                        <div className="font-bold text-gray-900">{b.car?.brand} {b.car?.model}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-800 font-medium">{b.user?.name || b.user?.fullName || 'Deleted'}</div>
                        <div className="text-[10px] text-gray-400">{b.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900">
                        {b.price.toLocaleString()} EGP
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Overview Card */}
        <div className="bg-gray-900 rounded-2xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.93 4.93l14.14 14.14" /></svg>
          </div>
          <div className="relative z-10">
            <p className="text-green-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Revenue Highlight</p>
            <h3 className="text-white text-xl font-bold mb-8">Monthly Earnings</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{loading ? '...' : (stats.monthlyRevenue || 0).toLocaleString()}</span>
              <span className="text-xl font-bold text-gray-400">EGP</span>
            </div>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">Global confirmation revenue for the current calendar month across the platform.</p>
          </div>
          <div className="mt-12 relative z-10">
             <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-green-500 rounded-full" />
             </div>
             <div className="flex justify-between mt-2">
               <span className="text-[10px] text-gray-500 font-bold uppercase">Growth Trend</span>
               <span className="text-[10px] text-green-500 font-bold uppercase">+12% vs last month</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, loading }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-gray-900">{loading ? '...' : value}</p>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
