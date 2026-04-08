/**
 * @file models/Job.js
 * @description Mongoose schema and model for a job listing.
 *
 * Schema fields:
 *  title       - Job title / position name (required)
 *  company     - Name of the hiring company (required)
 *  location    - Where the role is based (defaults to "Remote")
 *  type        - Employment type: Full-time | Part-time | Contract | Remote | Freelance
 *  salary      - Optional salary range / compensation string
 *  description - Free-text description of responsibilities and requirements
 *  tags        - Array of skill/technology keywords for filtering
 *  postedBy    - ObjectId reference to the User who created this listing
 *  timestamps  - createdAt / updatedAt managed by Mongoose
 */

const mongoose = require('mongoose');

/**
 * Mongoose schema definition for a Job document.
 * The `timestamps: true` option adds createdAt and updatedAt fields automatically.
 */
const jobSchema = new mongoose.Schema(
  {
    /** Job title / position name, e.g. "Senior React Developer" */
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },

    /** Name of the company offering the role, e.g. "Acme Corp" */
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },

    /**
     * Physical location or "Remote".
     * Defaults to "Remote" if the poster does not specify a location.
     */
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },

    /**
     * Employment classification.
     * Restricted to the enum values to keep the data consistent and filterable.
     */
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance'],
      default: 'Full-time',
    },

    /**
     * Optional salary / compensation string (free-form so it can accommodate
     * different formats: "$60k–$90k/yr", "Competitive", "€50,000", etc.)
     */
    salary: {
      type: String,
      default: '',
    },

    /**
     * Full job description including responsibilities, requirements, and benefits.
     * Stored as plain text; markdown rendering is handled client-side.
     */
    description: {
      type: String,
      default: '',
    },

    /**
     * Array of technology / skill tags, e.g. ["React", "TypeScript", "Remote"].
     * Used for keyword display on job cards and future filtering features.
     */
    tags: [{ type: String }],

    /**
     * Reference to the User who posted this job.
     * Required so we can enforce ownership checks on delete operations.
     * Populated via Job.findById(...).populate('postedBy', 'name email').
     */
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

// Export the Mongoose model named "Job" (maps to the "jobs" collection)
module.exports = mongoose.model('Job', jobSchema);
