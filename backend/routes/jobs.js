/**
 * @file routes/jobs.js
 * @description Express router for job listing CRUD operations.
 *
 * Routes:
 *  GET    /api/jobs       - Retrieve all jobs (public, sorted newest first)
 *  GET    /api/jobs/:id   - Retrieve a single job by MongoDB _id (public)
 *  POST   /api/jobs       - Create a new job listing (authenticated users only)
 *  DELETE /api/jobs/:id   - Delete a job listing (authenticated + must be the owner)
 *
 * All write operations require a valid JWT passed as `Authorization: Bearer <token>`.
 * The `protect` middleware sets `req.user` to the authenticated user document.
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────
// GET /api/jobs — Public
// ─────────────────────────────────────────────

/**
 * List all job postings, sorted by creation date (newest first).
 * The `postedBy` field is populated with the poster's name and email.
 *
 * Response 200: Array of Job documents
 * Response 500: Database error
 */
router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })              // most recent listings appear first
      .populate('postedBy', 'name email');  // embed poster info without the password
    res.json(jobs);
  } catch (err) {
    console.error('GET /api/jobs error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// GET /api/jobs/:id — Public
// ─────────────────────────────────────────────

/**
 * Retrieve a single job listing by its MongoDB ObjectId.
 * The `postedBy` field is populated so the client can display the poster's name.
 *
 * @param id - MongoDB ObjectId of the job
 * Response 200: Job document
 * Response 404: No job found with that id
 * Response 500: Database error
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'postedBy',
      'name email'
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error('GET /api/jobs/:id error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/jobs — Protected
// ─────────────────────────────────────────────

/**
 * Create a new job listing. Only authenticated users can post jobs.
 *
 * Request body: {
 *   title: string,       (required)
 *   company: string,     (required)
 *   location?: string,   (defaults to "Remote")
 *   type?: string,       (Full-time | Part-time | Contract | Remote | Freelance)
 *   salary?: string,     (e.g. "$60,000 – $90,000")
 *   description?: string,
 *   tags?: string[]
 * }
 * Response 201: Created Job document
 * Response 400: Validation error (missing required fields)
 * Response 401: Not authenticated
 * Response 500: Database error
 */
router.post(
  '/',
  protect, // Must be authenticated before reaching the handler
  [
    // Validate required fields
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('company').trim().notEmpty().withMessage('Company is required'),
  ],
  async (req, res) => {
    // Return the first validation error if any required field is missing
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Destructure all job fields from the request body
    const { title, company, location, type, salary, description, tags } =
      req.body;

    try {
      const job = await Job.create({
        title,
        company,
        location,
        type,
        salary,
        description,
        tags,
        postedBy: req.user._id, // Associate the job with the logged-in user
      });
      res.status(201).json(job);
    } catch (err) {
      console.error('POST /api/jobs error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─────────────────────────────────────────────
// DELETE /api/jobs/:id — Protected + Owner Only
// ─────────────────────────────────────────────

/**
 * Delete a job listing.
 * Only the user who originally posted the job may delete it (ownership check).
 *
 * @param id - MongoDB ObjectId of the job to delete
 * Response 200: { message: "Job deleted" }
 * Response 401: Not authenticated
 * Response 403: Authenticated but not the owner of this job
 * Response 404: No job found with that id
 * Response 500: Database error
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    // 404 if the job doesn't exist (or was already deleted)
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Ownership check — compare ObjectId strings to prevent unauthorised deletions
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('DELETE /api/jobs/:id error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
