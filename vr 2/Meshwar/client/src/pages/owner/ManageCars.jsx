import React, { useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const ManageCars = () => {

  const { isOwner, isPremium, user, axios, currency, fetchCars } = useAppContext()
  const [cars, setCars] = useState([])

  // Edit State
  const [editingCar, setEditingCar] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) {
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleAvailability = async (carId, approvalStatus) => {
    // Prevent toggling if not approved
    if (String(approvalStatus).toLowerCase() !== 'approved') {
      toast.error('You can only change availability for Approved cars.');
      return;
    }

    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
        fetchCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId) => {
    try {
      const confirm = window.confirm('Are you sure you want to permanently delete this car from your collection?')
      if (!confirm) return null

      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
        fetchCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openEditModal = (car) => {
    setEditingCar(car);
    setEditForm({
      _id: car._id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      pricePerDay: car.pricePerDay,
      category: car.category,
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      seating_capacity: car.seating_capacity,
      location: car.location,
      description: car.description,
    });
    setImageFile(null);
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (imageFile) formData.append('image', imageFile);
      formData.append('carData', JSON.stringify(editForm));

      const { data } = await axios.post('/api/owner/update-car', formData);
      if (data.success) {
        toast.success(data.message);
        setEditingCar(null);
        fetchOwnerCars();
        fetchCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    if (user && (isOwner || isPremium || user.isPremium)) {
      fetchOwnerCars()
    }
  }, [user, isOwner, isPremium])

  return (
    <div className='px-4 pt-10 md:px-10 w-full min-h-screen bg-[#F9FAFB] pb-10 relative'>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Cars</h1>
          <p className="text-sm text-gray-500 mt-1">View, update details, or toggle availability of your listed cars.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
            <span className="text-gray-400 mr-2">Total Cars:</span>
            {cars.length}
          </div>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          <h3 className="text-sm font-medium text-gray-900">No cars found</h3>
          <p className="text-sm text-gray-500 mt-1">You haven't added any cars to your collection yet.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider max-md:hidden">Category</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Daily Rate</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Availability</th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cars.map((car, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors group">

                    {/* Car Info */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={car.image} alt="" className="h-10 w-16 object-cover rounded shadow-sm border border-gray-100 mr-4" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{car.brand} {car.model}</div>
                          <div className="text-xs text-gray-500">{car.year} • {car.transmission} • {car.seating_capacity} Seats</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap max-md:hidden">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10">
                        {car.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {car.pricePerDay.toLocaleString()} <span className="text-xs text-gray-500 font-normal">{currency}/day</span>
                      </div>
                    </td>

                    {/* Admin Approval Status */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            String(car.status).toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 
                            String(car.status).toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {car.status || 'pending'}
                          </span>
                        </td>

                    {/* Availability Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide
                        ${car.isAvaliable ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                          'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10'}`}>
                        {car.isAvaliable ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Available</>
                        ) : (
                          <><span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span> Unavailable</>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right flex justify-end items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(car._id, car.status)}
                        disabled={String(car.status).toLowerCase() !== 'approved'}
                        title={String(car.status).toLowerCase() !== 'approved' ? "Waiting for Admin Approval" : car.isAvaliable ? "Mark Unavailable" : "Mark Available"}
                        className={`p-1.5 rounded-lg transition-colors ${String(car.status).toLowerCase() !== 'approved' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer'}`}
                      >
                        {car.isAvaliable ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        )}
                      </button>

                      <button
                        onClick={() => openEditModal(car)}
                        title="Edit Car"
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>

                      <button
                        onClick={() => deleteCar(car._id)}
                        title="Delete Car"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Edit Modal (Polished) */}
      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Car</h2>
                <p className="text-sm text-gray-500 mt-1">Update details for {editingCar.brand} {editingCar.model}</p>
              </div>
              <button onClick={() => setEditingCar(null)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form id="edit-car-form" onSubmit={handleEditSubmit} className="flex flex-col gap-6 text-sm">

                {/* Image Section */}
                <div className='flex items-center gap-5 p-4 rounded-xl border border-gray-100 bg-gray-50/50'>
                  <label htmlFor="edit-car-image" className="relative cursor-pointer group shrink-0">
                    <img src={imageFile ? URL.createObjectURL(imageFile) : editingCar.image} alt="" className='h-20 w-32 object-cover rounded-lg border border-gray-200 shadow-sm' />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg backdrop-blur-[2px]">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <input type="file" id="edit-car-image" accept="image/*" hidden onChange={e => setImageFile(e.target.files[0])} />
                  </label>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Car Cover Image</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">Click the image to upload a new one. For best results, use a high-resolution 16:9 aspect ratio image.</p>
                  </div>
                </div>

                {/* Form Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                    <input type="text" required className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900' value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
                    <input type="text" required className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900' value={editForm.model} onChange={e => setEditForm({ ...editForm, model: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                    <input type="number" required className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900' value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Rate ({currency})</label>
                    <input type="number" required className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900' value={editForm.pricePerDay} onChange={e => setEditForm({ ...editForm, pricePerDay: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900'>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <select value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900'>
                      <option value="Mansoura">Mansoura</option>
                      <option value="Cairo">Cairo</option>
                      <option value="Hurghada">Hurghada</option>
                      <option value="Alexandria">Alexandria</option>
                      <option value="Sharm El-sheikh">Sharm El-sheikh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Transmission</label>
                    <select value={editForm.transmission} onChange={e => setEditForm({ ...editForm, transmission: e.target.value })} className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900'>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuel Type</label>
                    <select value={editForm.fuel_type} onChange={e => setEditForm({ ...editForm, fuel_type: e.target.value })} className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900'>
                      <option value="Gas">Gas</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Seats</label>
                    <input type="number" required className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900' value={editForm.seating_capacity} onChange={e => setEditForm({ ...editForm, seating_capacity: e.target.value })} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea rows={3} required className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900 resize-none' value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}></textarea>
                  </div>

                </div>
              </form>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setEditingCar(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
              <button form="edit-car-form" type="submit" disabled={isUpdating} className={`px-6 py-2.5 bg-[#000] hover:bg-gray-800 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isUpdating ? (
                  <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  )
}

export default ManageCars