import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
  const { user, token, setToken, setUser, axios, fetchUser, logout } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If we have a token but user data hasn't loaded yet, show nothing (or a loader) to prevent flashing login
  if (token && !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // If there's a user logged in, but they are NOT an admin
  if (user && user.role !== 'admin') {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Unauthorized Access</h1>
            <p className="text-gray-600 mb-6">You are currently logged in as {user.name} ({user.role}). Admin privileges are required to view this page.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">Return to Home</a>
              <button onClick={() => logout()} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Sign Out & Switch to Admin</button>
            </div>
        </div>
     )
  }

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { data } = await axios.post('/api/user/login', { email, password });
        if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            axios.defaults.headers.common['Authorization'] = data.token;
            
            // Fetch user data right away to verify role
            const userRes = await axios.get('/api/user/data');
            if (userRes.data.success) {
                if (userRes.data.user.role === 'admin') {
                    setUser(userRes.data.user);
                    toast.success("Welcome, Admin");
                } else {
                    // Not an admin, logout immediately
                    localStorage.removeItem('token');
                    setToken(null);
                    axios.defaults.headers.common['Authorization'] = '';
                    toast.error("Access denied. Admin privileges required.");
                }
            }
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message || "Login failed");
    } finally {
        setLoading(false);
    }
  };

  // If no user and no token, show the Admin Login form
  if (!token || !user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
              <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl">
                  <div className="text-center mb-8">
                      <h2 className="text-3xl font-extrabold text-gray-900">Admin Portal</h2>
                      <p className="text-gray-500 mt-2 text-sm">Sign in to access the dashboard</p>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                          <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                            placeholder="admin@meshwar.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                      </div>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                      >
                          {loading ? 'Authenticating...' : 'Sign In as Admin'}
                      </button>
                  </form>
                  <div className="mt-6 text-center">
                      <a href="/" className="text-sm text-green-600 hover:text-green-800 font-medium">← Back to main site</a>
                  </div>
              </div>
          </div>
      )
  }

  // If user is logged in AND is an admin, render the nested admin routes
  return <Outlet />;
};

export default AdminLayout;
