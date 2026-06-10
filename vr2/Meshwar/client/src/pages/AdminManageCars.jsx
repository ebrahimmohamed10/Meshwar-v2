import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AdminManageCars = () => {
  const { adminToken } = useOutletContext() || {};
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (adminToken) {
      fetchCars();
    }
  }, [adminToken]);

  const fetchCars = async () => {
    try {
      const response = await axios.get('/api/admin/cars', {
        headers: { Authorization: adminToken }
      });
      if (response.data.success) {
        setCars(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch cars", error);
      toast.error("Failed to load platform cars.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`/api/admin/cars/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: adminToken } }
      );
      if (response.data.success) {
        setCars(cars.map(car => car._id === id ? { ...car, status: newStatus } : car));
        toast.success(`Car ${newStatus} successfully`);
      }
    } catch (error) {
      console.error("Failed to update car status", error);
      toast.error("Failed to update status.");
    }
  };


  const handleDeleteCar = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this car? This will remove it from the platform permanently.");
    if (isConfirmed) {
      try {
        const response = await axios.delete(`/api/admin/cars/${id}`, {
          headers: { Authorization: adminToken }
        });
        if (response.data.success) {
          setCars(cars.filter(car => car._id !== id));
          toast.success("Car deleted successfully");
          if (selectedCar?._id === id) setIsModalOpen(false);
        } else if (response.data.message !== "Unauthorized") {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Failed to delete car", error);
        toast.error("Failed to delete car.");
      }
    }
  };

  const openCarDetails = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = (car.brand && car.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.model && car.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.location && car.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || car.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage All Cars</h1>
          <p className="text-gray-500 mt-1">Global car inventory management and moderation across all owners.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
            <span className="text-gray-400 mr-2">Total Inventory:</span>
            {cars.length}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Search brand, model, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">Coupe</option>
              <option value="Luxury">Luxury</option>
              <option value="Van">Van</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Car Details</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specs</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner / Location</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Daily Rate</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-gray-500">Fetching platform inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No vehicles found matching your criteria.</td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={car._id}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    onClick={() => openCarDetails(car)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img src={car.image} alt={car.model} className="w-16 h-10 rounded-md object-cover border border-gray-100 shadow-sm" />
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{car.brand} {car.model}</div>
                          <div className="text-[11px] font-medium text-gray-400 uppercase">{car.category} • {car.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{car.transmission}</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{car.fuel_type}</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{car.seating_capacity} Seats</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.owner?.image || "https://randomuser.me/api/portraits/men/32.jpg"}
                          alt={car.owner?.name}
                          className="w-8 h-8 rounded-full border border-gray-100 shadow-sm object-cover"
                        />
                        <div>
                          <div className="text-gray-900 font-bold text-sm leading-none mb-1">{car.owner?.name || 'Deleted Account'}</div>
                          <div className="flex flex-col text-[10px] text-gray-400 space-y-0.5">
                            <span className="flex items-center gap-1"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{car.owner?.email || 'N/A'}</span>
                            <span className="flex items-center gap-1 font-mono"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{car.owner?.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-[10px] text-green-600 font-bold mt-1 uppercase tracking-tighter">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {car.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    
                    <td className="py-4 px-6 text-right">
                      <div className="text-gray-900 font-bold">{car.pricePerDay.toLocaleString()} EGP</div>
                      <div className="text-[10px] text-gray-400 uppercase">Per Day</div>
                    </td>
                    <td className="py-4 px-6 flex flex-col items-start gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${car.isAvaliable ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10'}`}>
                        {car.isAvaliable ? (
                          <><span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Available</>
                        ) : (
                          <><span className="w-1 h-1 rounded-full bg-rose-500 mr-1.5"></span> Booked/Offline</>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        car.status === 'approved' ? 'bg-green-100 text-green-800' :
                        car.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {car.status || 'pending'}
                      </span>
                    </td>


                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(!car.status || car.status === 'pending') && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(car._id, 'approved'); }}
                              className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"
                              title="Approve Car"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(car._id, 'rejected'); }}
                              className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-all"
                              title="Reject Car"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCar(car._id); }}
                          className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete vehicle from platform"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                    
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Car Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur text-gray-900 hover:bg-white rounded-full transition-all z-10 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {/* Left Side - Large Image & Basic Info */}
              <div className="md:w-1/2 relative bg-gray-900 flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)' }}>
                <img src={selectedCar.image} alt={selectedCar.model} className="max-w-full max-h-full object-contain opacity-95 transition-all duration-700 hover:scale-105" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded mb-2 inline-block">{selectedCar.category}</span>
                  <h2 className="text-3xl font-black text-white">{selectedCar.brand} {selectedCar.model}</h2>
                  <p className="text-gray-300 font-medium">{selectedCar.year} Model • {selectedCar.location}</p>
                </div>
              </div>

              {/* Right Side - Specs & Owner Info */}
              <div className="md:w-1/2 p-8 max-h-[80vh] overflow-y-auto bg-white">
                <div className="mb-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Vehicle Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedCar.description || 'No description provided for this vehicle.'}</p>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Technical Specs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Transmission</p>
                        <p className="text-sm font-bold text-gray-900">{selectedCar.transmission}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.054.455" /></svg></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Fuel Type</p>
                        <p className="text-sm font-bold text-gray-900">{selectedCar.fuel_type}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Capacity</p>
                        <p className="text-sm font-bold text-gray-900">{selectedCar.seating_capacity} Persons</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Price Mode</p>
                        <p className="text-sm font-bold text-gray-900">Per 24h</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCar.features && selectedCar.features.length > 0 ? (
                      selectedCar.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {feature}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No specific features listed.</p>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gray-900 text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Owner Contact</p>
                    <p className="text-lg font-black">{selectedCar.owner?.name || 'Meshwar Admin'}</p>
                    <p className="text-xs text-green-400">{selectedCar.owner?.email || 'support@meshwar.com'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Daily Price</p>
                    <p className="text-2xl font-black text-green-500">{selectedCar.pricePerDay.toLocaleString()} EGP</p>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => handleDeleteCar(selectedCar._id)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
                  >
                    Remove Car
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManageCars;
