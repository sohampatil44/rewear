const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req,res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash: hash });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user: { id: user._id, name, email, points: user.points } });
});

// Login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user: { id: user._id, name: user.name, email, points: user.points } });
});

module.exports = router;
