import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const ManageUsers = () => {
  const { adminToken } = useOutletContext() || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (adminToken) {
      fetchUsers();
    }
  }, [adminToken]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: adminToken }
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load platform users.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
    if (isConfirmed) {
      try {
        const response = await axios.delete(`/api/admin/users/${id}`, {
          headers: { Authorization: adminToken }
        });
        if (response.data.success) {
          setUsers(users.filter(user => user._id !== id));
          toast.success("User deleted successfully");
          if (selectedUser?._id === id) setIsModalOpen(false);
        } else {
          toast.error(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Failed to delete user", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const userName = user.name || user.fullName || '';
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (user.phone && user.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Users</h1>
          <p className="text-gray-500 mt-1">View, search, filter, and manage all registered platform accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
            <span className="text-gray-400 mr-2">Registered Users:</span>
            {users.length}
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
                placeholder="Search by name, email or phone..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full sm:w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              className="w-full sm:w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Customer</option>
              <option value="owner">Car Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Profile</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact & Wallet</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-gray-500">Loading platform users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={user._id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={user.image || "https://randomuser.me/api/portraits/men/32.jpg"} 
                            alt={user.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
                          />
                          {(user.isPremium || user.role === 'owner' || user.role === 'admin') && (
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border border-white" title="Premium Status">
                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.name || user.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-mono uppercase">ID: #{user._id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-800 font-medium text-sm">{user.email}</div>
                      <div className="flex items-center text-[11px] text-gray-500 mt-1">
                        <span className="mr-3 font-mono">{user.phone || 'No Phone'}</span>
                        <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">{(user.wallet || 0).toLocaleString()} EGP</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role || 'user'}
                        </span>
                        {user.role === 'admin' && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">Owner</span>}
                        {(user.isPremium || user.role === 'owner' || user.role === 'admin') && <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-md border border-yellow-200 uppercase tracking-tighter">Premium</span>}
                        {user.verificationStatus === 'verified' && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
                            Verified
                          </span>
                        )}
                        {user.verificationStatus === 'pending' && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-200 uppercase tracking-wider animate-pulse">
                            Pending
                          </span>
                        )}
                        {user.verificationStatus === 'rejected' && (
                          <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md border border-rose-200 uppercase tracking-wider" title={user.verificationError}>
                            Rejected
                          </span>
                        )}
                        {(!user.verificationStatus || user.verificationStatus === 'unverified') && (
                          <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 uppercase tracking-wider">
                            Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 text-sm font-medium">
                       {user.city && user.city !== 'Not Selected' ? user.city : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openUserDetails(user)}
                          className="text-green-600 hover:text-green-800 text-xs font-bold uppercase tracking-wider p-2 hover:bg-green-50 rounded-lg transition-all"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete user account"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Left Side - Profile Summary */}
                <div className="bg-gray-50 p-8 flex flex-col items-center text-center border-r border-gray-100">
                  <div className="relative mb-4">
                    <img 
                      src={selectedUser.image || "https://randomuser.me/api/portraits/men/32.jpg"} 
                      alt={selectedUser.name} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" 
                    />
                    {(selectedUser.isPremium || selectedUser.role === 'owner' || selectedUser.role === 'admin') && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-white p-2 rounded-full border-4 border-gray-50 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name || selectedUser.fullName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>
                  
                  <div className="w-full space-y-2 text-left">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Platform Role</p>
                      <p className="text-sm font-bold text-green-700 capitalize">{selectedUser.role}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Wallet Balance</p>
                      <p className="text-sm font-bold text-gray-900">{(selectedUser.wallet || 0).toLocaleString()} EGP</p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Full Details */}
                <div className="md:col-span-2 p-8 max-h-[80vh] overflow-y-auto">
                  {/* AI Verification Audit Box */}
                  <div className="mb-8 p-6 bg-gray-50 border border-gray-200/60 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">AI Verification Audit</h4>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        selectedUser.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                        selectedUser.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        selectedUser.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedUser.verificationStatus || 'unverified'}
                      </span>
                    </div>

                    {selectedUser.verificationStatus === 'rejected' && selectedUser.verificationError && (
                      <p className="text-xs text-rose-600 font-semibold mb-4 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                        Rejection Reason: {selectedUser.verificationError}
                      </p>
                    )}

                    {selectedUser.verificationReport ? (
                      <div className="bg-white rounded-xl border border-gray-150 p-4 max-h-60 overflow-y-auto">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-sm font-bold text-gray-900 mt-2 mb-1 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xs font-bold text-gray-800 mt-1.5 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="text-xs text-gray-600 leading-relaxed mb-1.5" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-xs text-gray-600" {...props} />,
                            li: ({node, ...props}) => <li className="text-xs text-gray-600" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-gray-800" {...props} />
                          }}
                        >
                          {selectedUser.verificationReport}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No AI verification report available for this user.</p>
                    )}
                  </div>

                  <div className="mb-8">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.dob || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Nationality</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.nationality || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Job / Occupation</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.job || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Location & Address</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Full Address</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">City / Country</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.city || 'N/A'}, {selectedUser.country || 'Global'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Zip Code</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.zipCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">License & Security</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">License Number</p>
                        <p className="text-sm font-medium text-gray-900 font-mono tracking-wider">{selectedUser.licenseNumber || 'Not Provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">License Expiry</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.licenseExpiry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">National ID / Passport</p>
                        <p className="text-sm font-medium text-gray-900 font-mono tracking-wider">{selectedUser.idNumber || 'Not Provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Emergency Contact</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.emergencyContact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ID Card Previews */}
                  {(selectedUser.idCardFront || selectedUser.idCardBack) && (
                    <div className="mb-6">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">ID Verification Documents</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedUser.idCardFront && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Front Side</p>
                            <img src={selectedUser.idCardFront} alt="ID Front" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                          </div>
                        )}
                        {selectedUser.idCardBack && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Back Side</p>
                            <img src={selectedUser.idCardBack} alt="ID Back" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Driving License Previews */}
                  {(selectedUser.licenseFront || selectedUser.licenseBack) && (
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">License Verification Documents</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedUser.licenseFront && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Front Side</p>
                            <img src={selectedUser.licenseFront} alt="License Front" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                          </div>
                        )}
                        {selectedUser.licenseBack && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Back Side</p>
                            <img src={selectedUser.licenseBack} alt="License Back" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
                >
                  Close Profile
                </button>
                <button 
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-md"
                >
                  Terminate Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;