import React from 'react';

const AdminPlaceholder = ({ title, description }) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Coming Soon</h2>
        <p className="text-gray-500 max-w-xs mt-2">This module is currently under development. Stay tuned for updates!</p>
      </div>
    </div>
  );
};

export const ManageCarsAdmin = () => <AdminPlaceholder title="Manage All Cars" description="Global car inventory management and moderation." />;
export const TotalBookingsAdmin = () => <AdminPlaceholder title="Total Bookings" description="Monitor and manage all bookings across the platform." />;
export const SystemSettingsAdmin = () => <AdminPlaceholder title="System Settings" description="Configure global platform parameters and security." />;
