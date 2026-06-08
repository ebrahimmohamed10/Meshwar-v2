import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { assets } from '../assets/assets';

// --- Icons ---
const DashboardIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const UsersIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-3.812" /></svg>);
const CarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
const BookingIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>);
const ProfitsIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const SettingsIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

const AdminLayout = () => {
  const { axios } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [adminToken, setAdminToken] = useState(sessionStorage.getItem('adminToken'));
  const [adminUser, setAdminUser] = useState(null);
  const [verifying, setVerifying] = useState(!!sessionStorage.getItem('adminToken'));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!adminToken) {
        setVerifying(false);
        return;
      }
      setVerifying(true);
      try {
        const { data } = await axios.get('/api/user/data', {
          headers: { Authorization: adminToken }
        });
        if (data.success && data.user.role === 'admin') {
          setAdminUser(data.user);
          setNewName(data.user.name || data.user.fullName || '');
        } else {
          sessionStorage.removeItem('adminToken');
          setAdminToken(null);
          setAdminUser(null);
        }
      } catch {
        sessionStorage.removeItem('adminToken');
        setAdminToken(null);
        setAdminUser(null);
      } finally {
        setVerifying(false);
      }
    };
    verifyAdmin();
  }, [adminToken]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/user/login', { email, password });
      if (data.success) {
        const userRes = await axios.get('/api/user/data', {
          headers: { Authorization: data.token }
        });
        if (userRes.data.success && userRes.data.user.role === 'admin') {
          sessionStorage.setItem('adminToken', data.token);
          setAdminToken(data.token);
          setAdminUser(userRes.data.user);
          setNewName(userRes.data.user.name || userRes.data.user.fullName || '');
          toast.success("Welcome, Admin");
        } else {
          toast.error("Access denied. Admin privileges required.");
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

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAdminToken(null);
    setAdminUser(null);
    toast.success('Admin session ended');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', newName);
      if (newImage) {
        formData.append('image', newImage);
      }

      const { data } = await axios.put('/api/user/update-profile', formData, {
        headers: {
          Authorization: adminToken,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success("Profile updated successfully");
        setAdminUser(data.user);
        setIsEditModalOpen(false);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred while updating profile");
    } finally {
      setUpdating(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!adminToken || !adminUser) {
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
              <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none" placeholder="admin@meshwar.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400">{loading ? 'Authenticating...' : 'Sign In as Admin'}</button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-green-600 hover:text-green-800 font-medium">← Back to main site</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex flex-col items-center mb-10 group relative">
          <div className="relative">
            <img src={adminUser?.image || "https://randomuser.me/api/portraits/men/32.jpg"} alt="Admin" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
            <button onClick={() => setIsEditModalOpen(true)} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-green-700 transition-all scale-0 group-hover:scale-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
            <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full ring-2 ring-white bg-green-500 group-hover:hidden" />
          </div>
          <h2 className="text-xl font-semibold mt-3 text-gray-800">{adminUser?.name || adminUser?.fullName || "Admin"}</h2>
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium uppercase mt-1">Super Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">MAIN MENU</p>
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}><DashboardIcon /><span>Overview</span></NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}><UsersIcon /><span>Manage Users</span></NavLink>
          <NavLink to="/admin/cars" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}><CarIcon /><span>Manage All Cars</span></NavLink>
          <NavLink to="/admin/bookings" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}><BookingIcon /><span>Total Bookings</span></NavLink>
          <NavLink to="/admin/profits" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ProfitsIcon />
            <span>Platform Revenues</span>
          </NavLink>

          <NavLink to="/admin/pending-finances" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Pending Finances</span>
          </NavLink>

          <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}><SettingsIcon /><span>System Settings</span></NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
          <img src={assets.logo} alt="Meshwar Logo" className="h-8 md:h-10 w-auto object-contain" />
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Welcome, <span className="font-medium text-gray-800">{adminUser?.name || adminUser?.fullName || "Admin"}</span></span>
            <button onClick={handleAdminLogout} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-xs">Sign Out</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ adminUser, adminToken, handleAdminLogout }} />
        </main>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Edit Admin Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                    <img src={newImage ? URL.createObjectURL(newImage) : (adminUser?.image || "https://randomuser.me/api/portraits/men/32.jpg")} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none" placeholder="Enter name" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" disabled={updating} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-green-400 flex items-center gap-2">{updating ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Updating...</>) : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
