import React, { useEffect } from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isOwner, navigate, user, token } = useAppContext()

  useEffect(() => {
    // If there is no token at all, redirect to home
    if (!token) {
      navigate('/')
      return
    }

    // Only redirect if we have finished loading the user and they are NOT an owner AND NOT premium
    if (user && !isOwner && !user.isPremium) {
      navigate('/')
    }
  }, [isOwner, user, token, navigate])

  // While checking authentication (token exists but user data hasn't arrived)
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Final check to prevent unauthorized render
  if (!isOwner && !user?.isPremium) return null;

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <NavbarOwner />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='flex-1 p-4 md:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
