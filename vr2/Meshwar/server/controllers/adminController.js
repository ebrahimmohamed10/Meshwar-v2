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

    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    const rejectedVerifications = await User.countDocuments({ verificationStatus: 'rejected' });

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
        recentBookings,
        verifiedUsers,
        pendingVerifications,
        rejectedVerifications
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
      .populate('user', '-password')
      .populate('owner', '-password')
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

export const getProfitsData = async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    const currentBalance = adminUser ? adminUser.wallet : 0;
    
    // Get all verified bookings that generated commission
    const profitBookings = await Booking.find({ handoverVerified: true })
      .populate('car')
      .populate('user')
      .populate('owner')
      .sort({ handoverVerifiedAt: -1, createdAt: -1 });
      
    res.status(200).json({
      success: true,
      balance: currentBalance,
      bookings: profitBookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingFinancesData = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ 
      status: { $in: ['pending', 'confirmed'] },
      handoverVerified: false
    })
      .populate('car')
      .populate('user', '-password')
      .populate('owner', '-password')
      .sort({ createdAt: -1 });

    const totalHeldFunds = pendingBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    res.status(200).json({
      success: true,
      totalHeldFunds,
      bookings: pendingBookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const dateNow = new Date();
    const historyEntry = {
      date: dateNow,
      status: 'verified',
      action: 'Admin Manual Override',
      reason: 'Approved manually by admin.'
    };

    user.verificationStatus = 'verified';
    user.verificationError = '';
    user.verificationReport = `### Admin Manual Audit\n\nApproved manually by administrator on ${new Date().toLocaleDateString()}.`;
    user.verifiedAt = dateNow;
    user.verificationHistory.push(historyEntry);
    await user.save();

    res.json({ success: true, message: "User verification approved manually", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const rejectReason = reason || 'Admin manual rejection';
    const historyEntry = {
      date: new Date(),
      status: 'rejected',
      action: 'Admin Manual Override',
      reason: rejectReason
    };

    user.verificationStatus = 'rejected';
    user.verificationError = rejectReason;
    user.verificationReport = `### Admin Manual Audit\n\nRejected manually by administrator on ${new Date().toLocaleDateString()}.\n\n**Reason**: ${rejectReason}`;
    user.verificationHistory.push(historyEntry);
    await user.save();

    res.json({ success: true, message: "User verification rejected manually", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unlockUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.verificationAttempts = 0;
    user.verificationLocked = false;
    user.verificationHistory.push({
      date: new Date(),
      status: user.verificationStatus,
      action: 'Admin Unlock Override',
      reason: 'Attempts counter reset and lockout lifted by administrator.'
    });
    await user.save();

    res.json({ success: true, message: "User verification attempts unlocked", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVerificationStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    const rejectedVerifications = await User.countDocuments({ verificationStatus: 'rejected' });
    const lockedUsers = await User.countDocuments({ verificationLocked: true });
    const unverifiedUsers = await User.countDocuments({ 
      $or: [
        { verificationStatus: 'unverified' },
        { verificationStatus: { $exists: false } }
      ] 
    });

    // Average attempts among users who have attempted
    const attemptedUsers = await User.find({ verificationAttempts: { $gt: 0 } });
    const totalAttempts = attemptedUsers.reduce((sum, u) => sum + (u.verificationAttempts || 0), 0);
    const avgAttempts = attemptedUsers.length > 0 ? (totalAttempts / attemptedUsers.length).toFixed(1) : 0;

    // Collect global logs from all users
    const allUsersWithLogs = await User.find({ "verificationHistory.0": { $exists: true } })
      .select('name email verificationHistory');

    const globalLogs = [];
    allUsersWithLogs.forEach(user => {
      user.verificationHistory.forEach(log => {
        globalLogs.push({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          date: log.date,
          status: log.status,
          action: log.action,
          reason: log.reason
        });
      });
    });

    // Sort global logs by date descending
    globalLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          verifiedUsers,
          pendingVerifications,
          rejectedVerifications,
          lockedUsers,
          unverifiedUsers,
          avgAttempts,
          attemptedUsersCount: attemptedUsers.length
        },
        logs: globalLogs.slice(0, 100) // limit to recent 100 entries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
