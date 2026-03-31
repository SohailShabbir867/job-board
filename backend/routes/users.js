/**
 * @file routes/users.js
 * @description Express router for user-specific operations.
 *
 * All routes here are protected — a valid JWT is required.
 * The `protect` middleware attaches the authenticated user to `req.user`.
 *
 * Routes:
 *  GET    /api/users/me/saved          - List the logged-in user's saved jobs
 *  POST   /api/users/me/saved/:jobId   - Save (bookmark) a job listing
 *  DELETE /api/users/me/saved/:jobId   - Unsave (remove bookmark) a job listing
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────
// GET /api/users/me/saved — Protected
// ─────────────────────────────────────────────

/**
 * Retrieve all jobs that the currently authenticated user has saved.
 * The `savedJobs` array of ObjectId references is populated with full Job documents.
 *
 * Response 200: Array of Job documents
 * Response 401: Not authenticated
 * Response 500: Database error
 */
router.get('/me/saved', protect, async (req, res) => {
  try {
    // Populate savedJobs to return full job objects instead of just ObjectId refs
    const user = await User.findById(req.user._id).populate('savedJobs');
    res.json(user.savedJobs);
  } catch (err) {
    console.error('GET /api/users/me/saved error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/users/me/saved/:jobId — Protected
// ─────────────────────────────────────────────

/**
 * Save (bookmark) a job listing to the authenticated user's profile.
 * Returns 400 if the job is already saved (idempotency guard).
 *
 * @param jobId - MongoDB ObjectId of the job to save
 * Response 200: { message: "Job saved" }
 * Response 400: Job is already saved by this user
 * Response 401: Not authenticated
 * Response 404: Job not found
 * Response 500: Database error
 */
router.post('/me/saved/:jobId', protect, async (req, res) => {
  try {
    // Verify the target job exists before modifying the user's savedJobs array
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user._id);

    // Check whether the user has already saved this job to avoid duplicates
    const alreadySaved = user.savedJobs.some(
      (id) => id.toString() === req.params.jobId
    );
    if (alreadySaved) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Push the job ObjectId into the user's savedJobs array and persist
    user.savedJobs.push(req.params.jobId);
    await user.save();
    res.json({ message: 'Job saved' });
  } catch (err) {
    console.error('POST /api/users/me/saved/:jobId error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/users/me/saved/:jobId — Protected
// ─────────────────────────────────────────────

/**
 * Remove (unsave) a job listing from the authenticated user's bookmarks.
 * This is a soft operation — the job itself is NOT deleted.
 *
 * @param jobId - MongoDB ObjectId of the job to unsave
 * Response 200: { message: "Job removed from saved" }
 * Response 401: Not authenticated
 * Response 500: Database error
 */
router.delete('/me/saved/:jobId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Filter out the specified job from the savedJobs array
    user.savedJobs = user.savedJobs.filter(
      (id) => id.toString() !== req.params.jobId
    );
    await user.save();
    res.json({ message: 'Job removed from saved' });
  } catch (err) {
    console.error('DELETE /api/users/me/saved/:jobId error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
