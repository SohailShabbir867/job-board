/**
 * @file middleware/auth.js
 * @description JWT authentication middleware for the Job Board API.
 *
 * The `protect` middleware:
 *  1. Reads the Authorization header and extracts the Bearer token.
 *  2. Verifies the token's signature against JWT_SECRET.
 *  3. Looks up the corresponding user in MongoDB (excluding the password field).
 *  4. Attaches the user document to `req.user` so downstream route handlers
 *     can access the authenticated user without making another DB call.
 *
 * Usage:
 *   router.post('/my-route', protect, handler);
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Express middleware that enforces JWT authentication.
 *
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Express next middleware
 * @returns {void}
 */
async function protect(req, res, next) {
  let token;

  // The client must send the JWT in the Authorization header as:
  //   Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Extract the raw token string (strip the "Bearer " prefix)
    token = req.headers.authorization.split(' ')[1];
  }

  // Reject request immediately if no token is present
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify the token signature and decode the payload.
    // Throws an error if the token is expired, malformed, or has a wrong signature.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user referenced by the token payload id.
    // We exclude the password hash from the returned document for security.
    req.user = await User.findById(decoded.id).select('-password');

    // Guard against tokens that reference a deleted / non-existent user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Authentication succeeded — pass control to the next handler
    next();
  } catch (err) {
    // Log the raw error server-side for debugging without exposing it to clients
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
}

module.exports = { protect };
