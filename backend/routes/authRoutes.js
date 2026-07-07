const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, address } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ fullName, email, phone, password, address });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// @route POST /api/auth/login  (used by both customers and admins)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: (email || '').toLowerCase() } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
