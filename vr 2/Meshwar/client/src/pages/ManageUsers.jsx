import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
    if (isConfirmed) {
      try {
        const response = await axios.delete(`/api/admin/users/${id}`);
        if (response.data.success) {
          setUsers(users.filter(user => user._id !== id));
          toast.success("User deleted successfully");
        } else {
          toast.error(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Failed to delete user", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  const handleOpenModal = (user) => {
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
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50 h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 mt-1">View, search, filter, and manage all registered accounts.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition"
            />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              className="w-full sm:w-40 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Customer</option>
              <option value="owner">Car Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="text-sm font-medium text-gray-500">
            Total Users: <span className="text-green-600 font-bold">{filteredUsers.length}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{user.name || user.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-400 mt-1">ID: #{user._id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{user.email || 'N/A'}</div>
                      <div className="text-gray-500 text-xs mt-1">{user.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md font-medium transition text-sm"
                        title="Delete user"
                      >
                        Delete
                      </button>
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

export default ManageUsers;