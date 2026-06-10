import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Dashboard = () => {

  const { axios, isOwner, isPremium, user, currency } = useAppContext()

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const fetchDashboardData = async () => {
    try {
      const { data: apiData } = await axios.get('/api/owner/dashboard')
      if (apiData.success) {
        setData(apiData.dashboardData)
      } else {
        toast.error(apiData.message)
      }
    } catch (error) {
      // Don't show toast for 401/403 during initial load transitions
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(error.message)
      }
    }
  }

  useEffect(() => {
    if (user && (isOwner || isPremium || user.isPremium)) {
      fetchDashboardData()
    }
  }, [user, isOwner, isPremium])

  const statCards = [
    {
      title: "Total Cars", 
      value: data.totalCars, 
      icon: <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>,
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      title: "Total Bookings", 
      value: data.totalBookings, 
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>,
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Pending Requests", 
      value: data.pendingBookings, 
      icon: <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Confirmed Trips", 
      value: data.completedBookings, 
      icon: <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
  ]

  return (
    <div className='px-4 pt-10 md:px-10 flex-1 min-h-screen bg-[#F9FAFB] pb-12'>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Owner Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor overall platform performance, bookings, and revenue.</p>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {statCards.map((card, index)=>(
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            key={index} 
            className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group'
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${card.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className='relative z-10 flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500 mb-1'>{card.title}</p>
                <h3 className='text-3xl font-bold text-gray-900 tracking-tight'>{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.border} border shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        
        {/* Recent Bookings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className='xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col'
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className='text-lg font-bold text-gray-900'>Recent Bookings</h2>
              <p className='text-sm text-gray-500 mt-0.5'>Latest customer reservations</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {data.recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm">No recent bookings found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentBookings.map((booking, index)=>(
                    <tr key={index} className='hover:bg-gray-50/50 transition-colors'>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <img src={booking.car.image} alt="" className='h-10 w-16 object-cover rounded shadow-sm border border-gray-100'/>
                          <div>
                            <p className='text-sm font-semibold text-gray-900'>{booking.car.brand} {booking.car.model}</p>
                            <p className='text-xs text-gray-500 mt-0.5'>Date: {booking.createdAt.split('T')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <span className='text-sm font-bold text-gray-900'>{(booking.price - (booking.priceBreakdown?.taxAmount || 0)).toLocaleString()} <span className="text-xs text-gray-500 font-normal">{currency}</span></span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase
                          ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' : 
                          'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative'
        >
          {/* Background decoration */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-50 to-transparent pointer-events-none"></div>
          
          <div className="p-6 border-b border-gray-100 bg-white relative z-10">
            <h2 className='text-lg font-bold text-gray-900'>Financials</h2>
            <p className='text-sm text-gray-500 mt-0.5'>Current month revenue</p>
          </div>
          
          <div className='p-8 flex-1 flex flex-col items-center justify-center relative z-10'>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            
            <p className='text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2'>Total Earnings</p>
            <h3 className='text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight text-center'>
              {data.monthlyRevenue.toLocaleString()}
            </h3>
            <span className='text-lg font-medium text-gray-500 mt-2'>{currency}</span>
          </div>
        </motion.div>
        
      </div>

    </div>
  )
}

export default Dashboard
