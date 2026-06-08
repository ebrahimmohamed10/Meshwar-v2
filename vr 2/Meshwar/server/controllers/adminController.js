import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Car from "../models/Car.js";
import SystemSettings from "../models/SystemSettings.js";


export const getSystemSettings = async (req, res) => {
  try {
    // findOneAndUpdate with upsert creates the doc if it doesn't exist yet
    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { upsert: true, new: true }
    );
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const { commissionRate, minWithdrawalAmount, currency } = req.body;

    // Validate commission rate (must be between 0 and 1)
    if (commissionRate !== undefined) {
      const rate = Number(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 1) {
        return res.json({ success: false, message: "Commission rate must be between 0 and 1 (e.g., 0.10 means 10%)" });
      }
    }

    const updated = await SystemSettings.findOneAndUpdate(
      { key: 'global' },
      {
        $set: {
          ...(commissionRate !== undefined && { commissionRate: Number(commissionRate) }),
          ...(minWithdrawalAmount !== undefined && { minWithdrawalAmount: Number(minWithdrawalAmount) }),
          ...(currency !== undefined && { currency }),
        }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Settings updated successfully", settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const totalRevenueResult = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    // Updated this part to include more details

    const recentBookings = await Booking.find()
      .populate('car')   // هنجيب كل بيانات العربية
      .populate('user')  // هنجيب كل بيانات العميل
      .populate('owner') // هنجيب كل بيانات المالك
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCars,
        totalBookings,
        totalRevenue,
        monthlyRevenue,
        recentBookings
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
};

export const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('owner', 'name email phone image').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch cars", error: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    await Car.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete car", error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car')
      .populate('user', 'name email phone')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings", error: error.message });
  }
};

export const cancelBookingByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Also mark car as available if it was confirmed
    if (booking.car) {
      await Car.findByIdAndUpdate(booking.car, { isAvaliable: true });
    }

    res.status(200).json({ success: true, message: "Booking cancelled by admin" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel booking", error: error.message });
  }
};
export const approveCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const car = await Car.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!car) {
        return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, message: `Car status updated to ${status}` });
  } catch (error) {
    console.error("Error updating car status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
