const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// GET /api/jobs — public
router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    console.error('GET /api/jobs error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id — public
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

// POST /api/jobs — protected
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('company').trim().notEmpty().withMessage('Company is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

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
        postedBy: req.user._id,
      });
      res.status(201).json(job);
    } catch (err) {
      console.error('POST /api/jobs error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/jobs/:id — protected, owner only
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
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
