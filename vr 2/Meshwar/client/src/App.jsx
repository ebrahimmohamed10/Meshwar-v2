import React, { useState } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CarDetails from './pages/CarDetails'
import Checkout from './pages/Checkout'
import Cars from './pages/Cars'
import MyBookings from './pages/MyBookings'
import MyAccount from './pages/MyAccount'
import Wallet from './pages/Wallet'
import Footer from './components/Footer'
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import AddCar from './pages/owner/AddCar'
import ManageCars from './pages/owner/ManageCars'
import ManageBookings from './pages/owner/ManageBookings'
import OwnerWallet from './pages/owner/Wallet'
import Login from './components/Login'
import LogoutOverlay from './components/LogoutOverlay'
import ChatBot from './components/ChatBot'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import { AnimatePresence } from 'motion/react'
import AdminDashboard from './pages/AdminDashboard'
import ManageUsers from './pages/ManageUsers'

import AdminManageCars from './pages/AdminManageCars'
import AdminTotalBookings from './pages/AdminTotalBookings'
import AdminSystemSettings from './pages/AdminSystemSettings'
import AdminProfits from './pages/AdminProfits'
import AdminLayout from './pages/AdminLayout'

const App = () => {

  const { showLogin, isLoggingOut } = useAppContext()
  const location = useLocation()
  const isOwnerPath = location.pathname.startsWith('/owner')
  const isAdminPath = location.pathname.startsWith('/admin')
  const isHome = location.pathname === '/'

  const hideLayoutElements = isOwnerPath || isAdminPath

  return (
    <>
      <Toaster />
      {showLogin && <Login />}
      <AnimatePresence>
        {isLoggingOut && <LogoutOverlay />}
      </AnimatePresence>

      {!hideLayoutElements && <Navbar />}

      <div className={(!hideLayoutElements && !isHome) ? 'pt-16' : ''}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/car-details/:id' element={<CarDetails />} />
          <Route path='/checkout/:id' element={<Checkout />} />
          <Route path='/cars' element={<Cars />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/wallet' element={<Wallet />} />
          <Route path='/my-account' element={<MyAccount />} />

          <Route path='/owner' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="manage-cars" element={<ManageCars />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
            <Route path="wallet" element={<OwnerWallet />} />
          </Route>

          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path='users' element={<ManageUsers />} />
            <Route path='cars' element={<AdminManageCars />} />
            <Route path='bookings' element={<AdminTotalBookings />} />
            <Route path='profits' element={<AdminProfits />} />
            <Route path='settings' element={<AdminSystemSettings />} />
          </Route>
        </Routes>
      </div>

      {!hideLayoutElements && <Footer />}

      <ChatBot />

    </>
  )
}

export default App