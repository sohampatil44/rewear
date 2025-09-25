const express = require('express');
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/auth');
const router = express.Router();

// Request swap
router.post('/request', authMiddleware, async (req,res) => {
  const { itemId } = req.body;
  const item = await Item.findById(itemId);
  if (!item || !item.isAvailable) return res.status(400).json({ message:'Not available' });
  const swap = await Swap.create({ item:itemId, requester:req.user._id });
  res.json(swap);
});

// Redeem via points
router.post('/redeem', authMiddleware, async (req,res) => {
  const { itemId } = req.body;
  const item = await Item.findById(itemId);
  if (!item || !item.isAvailable) return res.status(400).json({ message:'Not available' });
  const user = await User.findById(req.user._id);
  if (user.points < item.pointsValue) return res.status(400).json({ message:'Not enough points' });
  user.points -= item.pointsValue;
  item.isAvailable = false;
  await user.save(); await item.save();
  const swap = await Swap.create({ item:itemId, requester:user._id, viaPoints:true, status:'accepted' });
  res.json(swap);
});

// My swaps
router.get('/my', authMiddleware, async (req,res) => {
  const swaps = await Swap.find({ requester:req.user._id }).populate('item');
  res.json(swaps);
});

module.exports = router;
