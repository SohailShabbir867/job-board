const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;
    // Explicit string conversion prevents NoSQL injection via object-type payloads
    const safeEmail = String(email).toLowerCase();
    const safeName = String(name).trim();
    try {
      const exists = await User.findOne({ email: safeEmail });
      if (exists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const user = await User.create({ name: safeName, email: safeEmail, password });
      res.status(201).json({
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error('POST /api/auth/register error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    // Explicit string conversion prevents NoSQL injection via object-type payloads
    const safeEmail = String(email).toLowerCase();
    const safePassword = String(password);
    try {
      const user = await User.findOne({ email: safeEmail });
      if (!user || !(await user.matchPassword(safePassword))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.json({
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error('POST /api/auth/login error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const { _id: id, name, email } = req.user;
  res.json({ id, name, email });
});

module.exports = router;
