import React, { useState } from 'react'
import { assets, ownerMenuLinks } from '../../assets/assets'
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const Sidebar = () => {

    const { user, axios, fetchUser } = useAppContext()
    const location = useLocation()
    const [image, setImage] = useState('')

    const updateImage = async () => {
        try {
            const formData = new FormData()
            formData.append('image', image)

            const { data } = await axios.post('/api/owner/update-image', formData)

            if (data.success) {
                fetchUser()
                toast.success(data.message)
                setImage('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='relative min-h-screen flex flex-col md:w-64 w-20 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-all duration-300'>

            {/* Profile Section */}
            <div className='p-6 flex flex-col items-center border-b border-gray-100/60 relative'>
                <div className='group relative'>
                    <label htmlFor="image" className='cursor-pointer block relative'>
                        {/* Glowing ring effect */}
                        <div className='absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300'></div>
                        <img
                            src={image ? URL.createObjectURL(image) : user?.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"}
                            alt="Profile"
                            className='relative h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-105'
                        />
                        <input type="file" id='image' accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />

                        <div className='absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]'>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </div>
                    </label>
                </div>

                <div className='mt-4 text-center max-md:hidden'>
                    <h2 className='text-base font-bold text-gray-900 tracking-tight'>{user?.name || 'Loading...'}</h2>
                    <div className='inline-flex items-center justify-center mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100'>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        Owner
                    </div>
                </div>

                {/* Save Button for Image Upload */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: image ? 1 : 0, y: image ? 0 : -10 }}
                    className='absolute bottom-[-18px]'
                >
                    {image && (
                        <button
                            className='flex items-center gap-1.5 bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg hover:bg-black hover:shadow-xl transition-all cursor-pointer'
                            onClick={updateImage}
                        >
                            Save
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Navigation Links */}
            <div className='w-full flex-1 py-6 px-3 md:px-4 space-y-2 overflow-y-auto'>
                <p className='px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 max-md:hidden'>Main Menu</p>
                {ownerMenuLinks.map((link, index) => {
                    const isActive = link.path === location.pathname;

                    return (
                        <NavLink
                            key={index}
                            to={link.path}
                            className={`relative flex items-center justify-center md:justify-start gap-3 w-full px-2 md:px-4 py-3 rounded-xl transition-all duration-300 group
                            ${isActive
                                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 text-emerald-700 shadow-sm border border-emerald-100/50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeSidebarIndicator"
                                    className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                />
                            )}

                            {/* Custom SVG wrapper */}
                            <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-300 flex-shrink-0
                            ${isActive ? 'bg-white shadow-sm' : 'bg-transparent group-hover:bg-white group-hover:shadow-sm'}
                        `}>
                                <img
                                    src={isActive ? link.coloredIcon : link.icon}
                                    alt={link.name}
                                    className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-60 group-hover:opacity-100'}`}
                                />
                            </div>

                            <span className={`text-sm font-medium transition-colors max-md:hidden ${isActive ? 'text-emerald-700 font-semibold' : ''}`}>
                                {link.name}
                            </span>
                        </NavLink>
                    );
                })}
            </div>


        </div>
    )
}

export default Sidebar
