import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AdminVerificationStats = () => {
  const { adminToken } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('all'); // 'all', 'verified', 'rejected', 'pending', 'locked'

  useEffect(() => {
    if (adminToken) {
      fetchVerificationStats();
    }
  }, [adminToken]);

  const fetchVerificationStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/verification-stats', {
        headers: { Authorization: adminToken }
      });
      if (response.data.success) {
        setData(response.data.data);
      } else {
        toast.error("Failed to load statistics.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading statistics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 text-sm font-medium">Aggregating platform verification metrics...</p>
      </div>
    );
  }

  const { stats, logs } = data;

  // Percentage calculations
  const total = stats.totalUsers || 1;
  const verifiedPct = Math.round((stats.verifiedUsers / total) * 100);
  const pendingPct = Math.round((stats.pendingVerifications / total) * 100);
  const rejectedPct = Math.round((stats.rejectedVerifications / total) * 100);
  const unverifiedPct = Math.round((stats.unverifiedUsers / total) * 100);

  // SVG Donut metrics
  // Circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314.159
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  
  const verifiedOffset = circ - (stats.verifiedUsers / total) * circ;
  const pendingOffset = circ - ((stats.verifiedUsers + stats.pendingVerifications) / total) * circ;
  const rejectedOffset = circ - ((stats.verifiedUsers + stats.pendingVerifications + stats.rejectedVerifications) / total) * circ;
  const unverifiedOffset = 0; // default base layer

  // Filter logs list based on search and selected filter tab
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = logFilter === 'all' || log.status === logFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-emerald-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Verification Performance
          </h1>
          <p className="text-gray-500 mt-1">Monitor KYC verification statistics, AI audit reports, conversion rates, and lockout logs.</p>
        </div>
        <button 
          onClick={fetchVerificationStats} 
          className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 shadow-sm transition hover:shadow cursor-pointer flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18m0 0V3" /></svg>
          Refresh Statistics
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Verified Users</p>
            <p className="text-2xl font-black text-gray-900">{stats.verifiedUsers} <span className="text-xs font-semibold text-emerald-600">({verifiedPct}%)</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 shrink-0 border border-amber-100">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Audit</p>
            <p className="text-2xl font-black text-gray-900">{stats.pendingVerifications} <span className="text-xs font-semibold text-amber-600">({pendingPct}%)</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rejection Count</p>
            <p className="text-2xl font-black text-gray-900">{stats.rejectedVerifications} <span className="text-xs font-semibold text-rose-600">({rejectedPct}%)</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 shrink-0 border border-purple-100">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Locked Users</p>
            <p className="text-2xl font-black text-gray-900">{stats.lockedUsers} <span className="text-xs font-semibold text-purple-600">({stats.lockedUsers > 0 ? Math.round((stats.lockedUsers / total) * 100) : 0}%)</span></p>
          </div>
        </div>

      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Verification Status Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Status Distribution</h3>
          <div className="relative flex items-center justify-center h-48 mb-4">
            
            {/* SVG Interactive Donut Chart */}
            <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Donut base gray layer */}
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth="12" />
              
              {/* Unverified layer */}
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#9CA3AF" strokeWidth="12" 
                strokeDasharray={circ} strokeDashoffset={unverifiedOffset} />

              {/* Rejected layer */}
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F43F5E" strokeWidth="12" 
                strokeDasharray={circ} strokeDashoffset={rejectedOffset} />
                
              {/* Pending layer */}
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F59E0B" strokeWidth="12" 
                strokeDasharray={circ} strokeDashoffset={pendingOffset} />

              {/* Verified layer */}
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#10B981" strokeWidth="12" 
                strokeDasharray={circ} strokeDashoffset={verifiedOffset} />
            </svg>

            <div className="absolute text-center">
              <span className="text-3xl font-black text-gray-900">{verifiedPct}%</span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Rate</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-gray-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />Verified</span>
              <span className="font-bold text-gray-800">{stats.verifiedUsers} ({verifiedPct}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-gray-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />Pending</span>
              <span className="font-bold text-gray-800">{stats.pendingVerifications} ({pendingPct}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-gray-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />Rejected</span>
              <span className="font-bold text-gray-800">{stats.rejectedVerifications} ({rejectedPct}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-gray-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" />Unverified</span>
              <span className="font-bold text-gray-800">{stats.unverifiedUsers} ({unverifiedPct}%)</span>
            </div>
          </div>
        </div>

        {/* Verification Funnel Conversion */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between col-span-2">
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Verification Conversion Funnel</h3>
            <p className="text-xs text-gray-400 mb-6">Visual tracking from registration to KYC document upload and approval success.</p>
          </div>
          
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            
            {/* Step 1: Registered */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>1. Registered Accounts</span>
                <span>{stats.totalUsers} Users (100%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Step 2: Attempted */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>2. Attempted Verification</span>
                <span>{stats.attemptedUsersCount} Users ({Math.round((stats.attemptedUsersCount / total) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.attemptedUsersCount / total) * 100}%` }}></div>
              </div>
            </div>

            {/* Step 3: Verified */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>3. Succeeded (Verified)</span>
                <span>{stats.verifiedUsers} Users ({verifiedPct}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${verifiedPct}%` }}></div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>Average attempts per user: <strong>{stats.avgAttempts}</strong></span>
            <span>Overall Success Ratio: <strong>{Math.round((stats.verifiedUsers / (stats.attemptedUsersCount || 1)) * 100)}%</strong></span>
          </div>

        </div>

      </div>

      {/* Global Verification Logs and Trail */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Global Audit Trail Logs</h3>
            <p className="text-xs text-gray-400 mt-0.5">Real-time log of AI validations and administrator manually executed actions.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>

            {/* Filter select */}
            <select 
              value={logFilter} 
              onChange={(e) => setLogFilter(e.target.value)} 
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer font-bold text-gray-700"
            >
              <option value="all">All States</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>

          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-gray-200">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details / Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic font-medium">No verification audit logs match your search.</td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{log.userName}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{log.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate font-medium" title={log.reason}>
                      {log.reason || 'No details provided'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                        log.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        log.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 font-mono">
                      {new Date(log.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default AdminVerificationStats;
