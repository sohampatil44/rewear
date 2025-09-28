import express from "express";
import Swap from "../models/Swap.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Request a Swap
router.post("/", auth, async (req, res) => {
  try {
    const { itemOffered, itemRequested, toUser } = req.body;
    const swap = new Swap({
      itemOffered,
      itemRequested,
      fromUser: req.user.id,
      toUser,
    });
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Get swaps for logged in user
router.get("/", auth, async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }],
    })
      .populate("itemOffered")
      .populate("itemRequested")
      .populate("fromUser", "name")
      .populate("toUser", "name");

    res.json(swaps);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default router;
