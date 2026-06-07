import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const AdminSystemSettings = () => {
  const { axios } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Financial settings state
  const [commissionRate, setCommissionRate] = useState(10); // stored as percentage (10 = 10%)
  const [minWithdrawal, setMinWithdrawal] = useState(1000);

  // Load settings from DB on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await axios.get('/api/admin/settings');
        if (data.success) {
          setCommissionRate(Math.round(data.settings.commissionRate * 100)); // convert 0.10 -> 10
          setMinWithdrawal(data.settings.minWithdrawalAmount);
        }
      } catch (e) {
        // silently use defaults
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const rate = Number(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        toast.error('نسبة العمولة يجب أن تكون بين 0 و 100');
        return;
      }
      const { data } = await axios.put('/api/admin/settings', {
        commissionRate: rate / 100, // convert 10 -> 0.10 before saving
        minWithdrawalAmount: Number(minWithdrawal),
      });
      if (data.success) {
        toast.success('تم حفظ الإعدادات بنجاح!');
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, desc: 'Platform branding and contact details' },
    { id: 'financial', label: 'Financial Rates', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" /></svg>, desc: 'Fees, taxes, and payment gateways' },
    { id: 'security', label: 'Security & Access', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, desc: 'Auth, 2FA and admin permissions' },
    { id: 'notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, desc: 'Email, SMS and push config' },
  ];

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [securityStates, setSecurityStates] = useState({
    twoFA: true,
    autoLock: true,
    verification: false,
    encryption: true
  });

  const handleSecurityToggle = (key) => {
    setSecurityStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Core</h1>
        <p className="text-gray-500 mt-2 text-lg">Central control for platform logic, financial models, and global security.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Modern Sidebar Navigation */}
        <div className="xl:w-80 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left ${
                activeTab === tab.id 
                  ? 'bg-white shadow-xl shadow-gray-200/50 border-l-4 border-green-600 ring-1 ring-gray-100' 
                  : 'hover:bg-gray-100/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <div className={`p-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400 group-hover:bg-white'}`}>
                {tab.icon}
              </div>
              <div>
                <p className={`font-bold text-sm ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`}>{tab.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic Settings Canvas */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-gray-200/20 overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-8 border-b border-gray-100 bg-gray-50/30">
             <h2 className="text-2xl font-black text-gray-900 capitalize">{activeTab} Settings</h2>
             <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">Global Configuration Module</p>
          </div>

          <div className="flex-1 p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div 
                  key="general"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
                >
                  <InputField label="Platform Identity" value="Meshwar" helper="The public name of your application." />
                  <InputField label="Official Support Email" value="admin@meshwar.com" helper="Contact address shown to users." />
                  <InputField label="Emergency Support Line" value="01111915092" helper="Phone number for critical issues." />
                  <InputField label="System Timezone" value="Cairo (GMT+2)" helper="Time used for booking logs." disabled />
                  <div className="md:col-span-2 mt-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Maintenance Mode</label>
                    <div className={`p-4 rounded-2xl border transition-colors flex items-center justify-between ${maintenanceMode ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                      <div>
                        <p className={`font-bold text-sm ${maintenanceMode ? 'text-red-900' : 'text-amber-900'}`}>
                          {maintenanceMode ? 'SYSTEM IS OFFLINE' : 'Offline for Maintenance'}
                        </p>
                        <p className={`text-xs mt-0.5 ${maintenanceMode ? 'text-red-700' : 'text-amber-700'}`}>
                          {maintenanceMode ? 'All public routes are currently redirected to maintenance page.' : 'Redirect all users to a maintenance page.'}
                        </p>
                      </div>
                      <Toggle enabled={maintenanceMode} onClick={() => setMaintenanceMode(!maintenanceMode)} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'financial' && (
                <motion.div 
                  key="financial"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Revenue & Tax Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Live commission rate field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Revenue Commission (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={commissionRate}
                            onChange={e => setCommissionRate(e.target.value)}
                            className="w-full px-5 py-3.5 bg-gray-50/50 border-2 border-green-200 rounded-2xl text-sm font-black text-green-800 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 ml-1">حصة Meshwar من كل عملية تأجير. تُخصم تلقائياً عند تحقق PIN الاستلام.</p>
                      </div>
                      <InputField label="Value Added Tax (%)" value="14" helper="Standard government VAT applied to total price." />
                      <InputField label="Booking Cancellation Fee (EGP)" value="150" helper="Fixed penalty charged to customers for late cancels." />
                      <InputField label="Insurance Surcharge (%)" value="5" helper="Optional platform insurance fee per booking." />
                    </div>
                  </div>

                  <div className="p-8 bg-green-50 rounded-3xl border border-green-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600 shrink-0">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" /></svg>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="font-black text-green-900 text-lg">Wallet Withdrawal Threshold</p>
                      <p className="text-sm text-green-700 leading-relaxed">الحد الأدنى للرصيد المتاح قبل تمكن المالك من طلب سحب.</p>
                      <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            value={minWithdrawal}
                            onChange={e => setMinWithdrawal(e.target.value)}
                            className="w-36 pl-4 pr-12 py-2.5 bg-white border-2 border-green-200 rounded-xl text-lg font-black text-green-800 focus:outline-none focus:border-green-500 transition-all shadow-sm"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-green-600/50 text-xs">EGP</span>
                        </div>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Minimum Limit</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Payout Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Automatic Payout Cycle</label>
                         <select className="w-full px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:border-green-600/30 focus:ring-4 focus:ring-green-500/5 outline-none transition-all">
                           <option>Every Monday (Weekly)</option>
                           <option>1st and 15th (Bi-Weekly)</option>
                           <option selected>Monthly (Last Day)</option>
                           <option>Manual Approval Only</option>
                         </select>
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Processing Fee (EGP)</label>
                         <input type="text" defaultValue="25" className="w-full px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:border-green-600/30 outline-none transition-all" />
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <SecurityToggle title="Two-Factor Authentication" desc="Require OTP for all administrator logins." enabled={securityStates.twoFA} onToggle={() => handleSecurityToggle('twoFA')} />
                  <SecurityToggle title="Automatic Account Lock" desc="Lock user account after 5 failed login attempts." enabled={securityStates.autoLock} onToggle={() => handleSecurityToggle('autoLock')} />
                  <SecurityToggle title="Document Verification" desc="Manually approve all ID documents before rental." enabled={securityStates.verification} onToggle={() => handleSecurityToggle('verification')} />
                  <SecurityToggle title="Encrypted ID Storage" desc="Enable bank-grade encryption for user IDs." enabled={securityStates.encryption} onToggle={() => handleSecurityToggle('encryption')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium italic">Last updated: Today at 02:45 PM</p>
            <div className="flex gap-4">
              <button className="px-8 py-3 text-gray-500 font-bold hover:text-gray-900 transition">Discard</button>
              <button 
                onClick={handleSave} 
                className={`px-10 py-3 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, helper, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{label}</label>
    <input 
      type="text" 
      defaultValue={value} 
      disabled={disabled}
      className={`w-full px-5 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:border-green-600/30 focus:ring-4 focus:ring-green-500/5 outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
    <p className="text-[10px] text-gray-400 ml-1">{helper}</p>
  </div>
);

const SecurityToggle = ({ title, desc, enabled, onToggle }) => (
  <div className="p-6 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between transition-colors">
    <div className="flex items-center gap-4">
       <div className={`p-3 rounded-xl ${enabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
       </div>
       <div>
         <p className="font-bold text-gray-900 text-sm">{title}</p>
         <p className="text-xs text-gray-400">{desc}</p>
       </div>
    </div>
    <Toggle enabled={enabled} onClick={onToggle} />
  </div>
);

const Toggle = ({ enabled, onClick }) => (
  <div 
    onClick={onClick}
    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-300'}`}
  >
    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
  </div>
);

export default AdminSystemSettings;
