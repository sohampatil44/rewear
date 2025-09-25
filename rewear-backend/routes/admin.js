const express = require('express');
const Item = require('../models/Item');
const { authMiddleware } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/admin');
const router = express.Router();

// Pending items
router.get('/items/pending', authMiddleware, adminOnly, async (req,res) => {
  res.json(await Item.find({ isApproved:false }));
});

// Approve
router.post('/items/:id/approve', authMiddleware, adminOnly, async (req,res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message:'Not found' });
  item.isApproved = true;
  await item.save();
  res.json(item);
});

// Reject
router.post('/items/:id/reject', authMiddleware, adminOnly, async (req,res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message:'Item rejected' });
});

module.exports = router;
