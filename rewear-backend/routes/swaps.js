// backend/routes/swaps.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import Swap from "../models/Swap.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/swaps
 * @desc    Create a new swap request
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { itemRequested, itemOffered } = req.body;

    if (!itemRequested || !itemOffered) {
      return res.status(400).json({ message: "Both items are required" });
    }

    const requestedItem = await Item.findById(itemRequested).populate("uploader");
    const offeredItem = await Item.findById(itemOffered).populate("uploader");

    if (!requestedItem || !offeredItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (requestedItem.uploader._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot swap with your own item" });
    }

    const swap = new Swap({
      fromUser: req.user.id,
      toUser: requestedItem.uploader._id,
      itemRequested,
      itemOffered,
      status: "pending",
      isAdminApproved: false,
    });

    await swap.save();
    res.status(201).json(swap);
  } catch (error) {
    console.error("Swap Create Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/swaps
 * @desc    Get all swaps for logged-in user (incoming & outgoing)
 * @access  Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }]
    })
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("itemOffered", "title imageUrl")
      .populate("itemRequested", "title imageUrl")
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error("Get Swaps Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/swaps/:id
 * @desc    Update swap status (accept/reject)
 * @access  Private
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    // Only recipient can update the status
    if (swap.toUser.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this swap" });
    }

    swap.status = status;
    await swap.save();

    res.json(swap);
  } catch (error) {
    console.error("Swap Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/swaps/:id/approve
 * @desc    Admin approves a swap & transfer points
 * @access  Admin Only
 */
router.put("/:id/approve", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Only admin can approve swaps" });
    }

    const swap = await Swap.findById(req.params.id).populate("fromUser");
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    if (swap.isAdminApproved) {
      return res.status(400).json({ message: "Already approved" });
    }

    const requester = await User.findById(swap.fromUser._id);
    const admin = await User.findById(req.user.id);

    if (requester.points < swap.pointsUsed) {
      return res.status(400).json({ message: "Not enough points" });
    }

    requester.points -= swap.pointsUsed;
    admin.points += swap.pointsUsed;

    await requester.save();
    await admin.save();

    swap.isAdminApproved = true;
    swap.status = "accepted";
    await swap.save();

    res.json({ message: "Swap approved by admin", swap });
  } catch (error) {
    console.error("Swap Approve Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;