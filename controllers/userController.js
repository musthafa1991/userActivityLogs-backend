const { createLog } = require("../models/logModel");
const useragent = require("user-agent");

const { User } = require("../models/userModel");

// Get user data by ID
const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update user data by ID
const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userAgentData = useragent.parse(req.headers["user-agent"]);
    const userAgent = userAgentData?.fullName?.trim()
      ? userAgentData.fullName.trim()
      : userAgentData?.full || "Unknown User-Agent";

    await createLog({
      userId,
      userEmail: updatedUser.email,
      action: "profile_update",
      details: {
        ip: req.ip,
        userAgent: userAgent,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUserById,
  updateUserById,
};
