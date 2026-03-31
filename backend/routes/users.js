const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// GET /api/users/me/saved — get current user's saved jobs
router.get('/me/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');
    res.json(user.savedJobs);
  } catch (err) {
    console.error('GET /api/users/me/saved error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/me/saved/:jobId — save a job
router.post('/me/saved/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedJobs.some(
      (id) => id.toString() === req.params.jobId
    );
    if (alreadySaved) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    user.savedJobs.push(req.params.jobId);
    await user.save();
    res.json({ message: 'Job saved' });
  } catch (err) {
    console.error('POST /api/users/me/saved/:jobId error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/me/saved/:jobId — unsave a job
router.delete('/me/saved/:jobId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
