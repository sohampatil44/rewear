// routes/admin.js
import express from "express";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Swap from "../models/Swap.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

/* USERS MANAGEMENT */
router.get("/users", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.delete("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

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

/* ITEMS MANAGEMENT */
router.get("/pending-count", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const count = await Item.countDocuments({ isApproved: false });
    res.json({ count });
  } catch (err) {
    console.error("Pending Count Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ FIX: Fetch ALL items (approved + pending) so admin can see complete list
router.get("/items", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const items = await Item.find()  // ✅ No filter - get ALL items
      .populate("uploader", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("Admin Items Error:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// ✅ Approve item
router.put("/items/:id/approve", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.isApproved = true;
    await item.save();

    const populatedItem = await item.populate("uploader", "name email");
    res.json(populatedItem);
  } catch (err) {
    console.error("Approve Item Error:", err);
    res.status(500).json({ message: "Error approving item" });
  }
});

// ✅ Delete item
router.delete("/items/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    
    res.json({ message: "Item deleted", _id: req.params.id });
  } catch (err) {
    console.error("Delete Item Error:", err);
    res.status(500).json({ message: "Error deleting item" });
  }
});

/* SWAPS MANAGEMENT */
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