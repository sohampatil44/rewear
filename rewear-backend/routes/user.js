// routes/user.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get user profile - FIXED VERSION
router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 User ID from auth:", req.user); // Debug log
    
    // Handle different ways auth middleware might set req.user
    const userId = req.user.id || req.user.userId || req.user._id || req.user;
    
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email); // Debug log
    res.json(user);
    
  } catch (err) {
    console.error("❌ Error in /api/users/me:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id || req.user;
    const { name, email, phone, address, city, zipCode } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        email, 
        phone, 
        address, 
        city, 
        zipCode,
        updatedAt: new Date()
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;