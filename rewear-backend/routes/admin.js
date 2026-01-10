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

// ✅ NEW: No-cache middleware for all admin routes
const noCacheMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};

// ✅ Apply no-cache to all admin routes
router.use(noCacheMiddleware);

/* USERS MANAGEMENT */
router.get("/users", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    console.log(`✅ Returning ${users.length} users to admin`);
    res.json(users);
  } catch (err) {
    console.error("Admin Users Error:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.delete("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    console.log(`✅ User deleted: ${req.params.id}`);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete User Error:", err);
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

    console.log(`✅ User role updated: ${req.params.id} -> isAdmin=${isAdmin}`);
    res.json(user);
  } catch (err) {
    console.error("Update Role Error:", err);
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

router.get("/items", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const items = await Item.find()
      .populate("uploader", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Returning ${items.length} items to admin`);
    res.json(items);
  } catch (err) {
    console.error("Admin Items Error:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

router.put("/items/:id/approve", authMiddleware, requireAdmin, async (req, res) => {
  try {
    console.log(`📝 Approving item: ${req.params.id}`);
    
    const item = await Item.findById(req.params.id);
    if (!item) {
      console.error(`❌ Item not found: ${req.params.id}`);
      return res.status(404).json({ message: "Item not found" });
    }

    console.log(`📝 Before: isApproved=${item.isApproved}`);
    item.isApproved = true;
    await item.save();
    console.log(`✅ After: isApproved=${item.isApproved}`);

    const populatedItem = await item.populate("uploader", "name email");
    res.json(populatedItem);
  } catch (err) {
    console.error("Approve Item Error:", err);
    res.status(500).json({ message: "Error approving item" });
  }
});

router.delete("/items/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    console.log(`🗑️ Deleting item: ${req.params.id}`);
    
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.error(`❌ Item not found: ${req.params.id}`);
      return res.status(404).json({ message: "Item not found" });
    }
    
    console.log(`✅ Item deleted successfully: ${req.params.id}`);
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

    console.log(`✅ Returning ${swaps.length} swaps to admin`);
    res.json(swaps);
  } catch (err) {
    console.error("Admin Swaps Error:", err);
    res.status(500).json({ message: "Error fetching swaps" });
  }
});

router.put("/swaps/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`📝 Updating swap ${req.params.id} to status: ${status}`);
    
    const swap = await Swap.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("itemOffered", "title")
      .populate("itemRequested", "title");

    console.log(`✅ Swap updated: ${req.params.id}`);
    res.json(swap);
  } catch (err) {
    console.error("Update Swap Error:", err);
    res.status(500).json({ message: "Error updating swap" });
  }
});

export default router;