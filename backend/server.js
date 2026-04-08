/**
 * @file server.js
 * @description Express application entry point for the Job Board MERN API.
 *
 * Responsibilities:
 *  - Configures middleware (CORS, JSON body parser, rate limiting)
 *  - Mounts API route handlers under /api/*
 *  - Connects to MongoDB via Mongoose
 *  - Starts the HTTP server on the configured PORT
 *
 * Environment variables (see .env.example):
 *  PORT          - TCP port the server listens on (default: 5000)
 *  MONGO_URI     - MongoDB connection string (default: mongodb://localhost:27017/jobboard)
 *  JWT_SECRET    - Secret key used to sign/verify JWTs
 *  JWT_EXPIRES_IN - JWT expiry duration (default: 7d)
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables from .env file into process.env
dotenv.config();

const app = express();

// ─────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────

// Enable Cross-Origin Resource Sharing so the React dev server (port 5173)
// can talk to this API (port 5000) without browser CORS errors.
app.use(cors());

// Parse incoming JSON request bodies (required for POST/PUT endpoints).
app.use(express.json());

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────

/**
 * Global rate limiter — applies to every route.
 * Allows up to 200 requests per 15-minute window per IP address.
 * Protects against general abuse / scraping.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 200,                  // maximum requests per window per IP
  standardHeaders: true,     // return RateLimit-* headers
  legacyHeaders: false,      // disable X-RateLimit-* legacy headers
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

/**
 * Stricter auth rate limiter — applied only to /api/auth/* routes.
 * Allows up to 20 auth requests per 15-minute window per IP.
 * Mitigates brute-force login/register attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // tighter cap for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

// Authentication routes (register, login, get current user)
// The authLimiter middleware is applied exclusively to these routes.
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Job listing routes (public reads + protected create/delete)
app.use('/api/jobs', require('./routes/jobs'));

// User profile routes (saved jobs CRUD — all protected)
app.use('/api/users', require('./routes/users'));

// Simple health-check endpoint — useful for uptime monitors and CI checks.
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─────────────────────────────────────────────
// 404 Fallback Handler
// ─────────────────────────────────────────────
// Must be registered AFTER all other routes so it only catches unknown paths.
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─────────────────────────────────────────────
// Database Connection + Server Start
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobboard';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    // MongoDB is ready — start accepting HTTP requests
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    // Fatal: cannot operate without a database connection
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Export the Express app for testing purposes
module.exports = app;
