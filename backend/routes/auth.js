/**
 * @file routes/auth.js
 * @description Express router for user authentication.
 *
 * Routes:
 *  POST /api/auth/register  - Create a new user account, returns JWT + user info
 *  POST /api/auth/login     - Authenticate with email/password, returns JWT + user info
 *  GET  /api/auth/me        - Return the currently authenticated user (JWT required)
 *
 * Security notes:
 *  - Passwords are hashed by the User model's pre-save hook (bcrypt, 10 rounds)
 *  - Email/password inputs are validated with express-validator before processing
 *  - String() coercion is applied to all user-supplied values to prevent
 *    NoSQL injection via object-type payloads (e.g. { $gt: "" })
 *  - This router is wrapped with authLimiter in server.js (20 req / 15 min per IP)
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────
// Helper: Generate JWT
// ─────────────────────────────────────────────

/**
 * Creates a signed JSON Web Token for a given user ID.
 *
 * @param {string|import('mongoose').Types.ObjectId} id - The user's MongoDB _id
 * @returns {string} Signed JWT string
 */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // default: 7 days
  });
}

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * Request body: { name: string, email: string, password: string }
 * Response 201: { token: string, user: { id, name, email } }
 * Response 400: validation error or email already taken
 * Response 500: unexpected server/DB error
 */
router.post(
  '/register',
  [
    // Validate and sanitize each field before the handler runs
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(), // normalizeEmail lowercases and strips dots in Gmail addresses
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    // Return the first validation error if any field is invalid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Explicit String() conversion prevents NoSQL injection via object-type payloads
    // e.g. an attacker sending { "email": { "$gt": "" } } instead of a string
    const safeEmail = String(email).toLowerCase();
    const safeName = String(name).trim();

    try {
      // Reject the request if the email is already in use
      const exists = await User.findOne({ email: safeEmail });
      if (exists) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create the user — the pre-save hook in User.js will hash the password
      const user = await User.create({ name: safeName, email: safeEmail, password });

      // Respond with a fresh JWT and basic user info (no password)
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

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────

/**
 * Authenticate a user and return a JWT.
 *
 * Request body: { email: string, password: string }
 * Response 200: { token: string, user: { id, name, email } }
 * Response 400: validation error
 * Response 401: invalid credentials (deliberately vague to prevent enumeration)
 * Response 500: unexpected server/DB error
 */
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
    // Validate inputs first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Coerce to string to prevent NoSQL injection attacks
    const safeEmail = String(email).toLowerCase();
    const safePassword = String(password);

    try {
      // Look up the user by email
      const user = await User.findOne({ email: safeEmail });

      // Use a timing-safe comparison: matchPassword always calls bcrypt.compare
      // which takes constant time regardless of whether the user was found.
      if (!user || !(await user.matchPassword(safePassword))) {
        // Intentionally vague to prevent username enumeration attacks
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Authentication successful — issue a new JWT
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

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────

/**
 * Return the profile of the currently authenticated user.
 * Requires a valid JWT in the Authorization header (enforced by `protect`).
 *
 * Response 200: { id: string, name: string, email: string }
 * Response 401: if the token is missing, expired, or invalid
 */
router.get('/me', protect, (req, res) => {
  // req.user is set by the `protect` middleware after JWT verification
  const { _id: id, name, email } = req.user;
  res.json({ id, name, email });
});

module.exports = router;
