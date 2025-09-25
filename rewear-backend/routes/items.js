const express = require('express');
const Item = require('../models/Item');
const { authMiddleware } = require('../middlewares/auth');
const router = express.Router();

// List items (approved + available)
router.get('/', async (req,res) => {
  const items = await Item.find({ isApproved:true, isAvailable:true }).populate('uploader','name');
  res.json(items);
});

// Add new item
router.post('/', authMiddleware, async (req,res) => {
  const item = await Item.create({ ...req.body, uploader: req.user._id, isApproved:false });
  res.json(item);
});

// Item detail
router.get('/:id', async (req,res) => {
  const item = await Item.findById(req.params.id).populate('uploader','name email');
  if (!item) return res.status(404).json({ message:'Not found' });
  res.json(item);
});

module.exports = router;
