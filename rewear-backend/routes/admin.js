// routes/admin.js
import express from "express";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Swap from "../models/Swap.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ Middleware to check admin
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

/* ------------------------------
   USERS MANAGEMENT
--------------------------------*/
// Get all users
router.get("/users", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Delete user
router.delete("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Update user role (make/remove admin)
router.put("/users/:id/role", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating role" });
  }
});

/* ------------------------------
   ITEMS MANAGEMENT (already present in your code)
--------------------------------*/
// Get all items (for approval)
router.get("/items", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const items = await Item.find().populate("uploader", "name email");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Approve item
router.put("/items/:id/approve", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("uploader", "name email");

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error approving item" });
  }
});

// Delete item
router.delete("/items/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item" });
  }
});


/* ------------------------------
   SWAPS MANAGEMENT
--------------------------------*/
// Get all swaps
router.get("/swaps", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const swaps = await Swap.find()
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("itemOffered", "title")
      .populate("itemRequested", "title");

    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: "Error fetching swaps" });
  }
});

// Update swap status
router.put("/swaps/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const swap = await Swap.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("itemOffered", "title")
      .populate("itemRequested", "title");

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: "Error updating swap" });
  }
});

export default router;
