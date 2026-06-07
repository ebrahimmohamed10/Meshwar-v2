import express from 'express'
import { getDashboardStats, getAllUsers, deleteUser, getAllCars, deleteCar, getAllBookings, cancelBookingByAdmin, approveCar, getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
const router = express.Router()

router.get('/stats', getDashboardStats)
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/cars', getAllCars);
router.delete('/cars/:id', deleteCar);
router.get('/bookings', getAllBookings);
router.post('/bookings/:id/cancel', cancelBookingByAdmin);
router.put('/cars/:id/status', approveCar);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router