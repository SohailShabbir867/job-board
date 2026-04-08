/**
 * @file models/User.js
 * @description Mongoose schema and model for a registered user.
 *
 * Schema fields:
 *  name      - Display name of the user
 *  email     - Unique email used for authentication (stored lowercase)
 *  password  - bcrypt-hashed password (never stored as plain text)
 *  savedJobs - Array of ObjectId references to Job documents the user has bookmarked
 *  timestamps - createdAt / updatedAt automatically managed by Mongoose
 *
 * Instance methods:
 *  matchPassword(plain) - Compares a plain-text password against the stored hash
 *
 * Hooks:
 *  pre('save') - Automatically hashes the password before it is persisted
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Mongoose schema definition for a User document.
 * The `timestamps: true` option automatically adds createdAt and updatedAt fields.
 */
const userSchema = new mongoose.Schema(
  {
    /** User's full display name */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    /**
     * Email address — must be unique across all users.
     * Stored in lowercase to prevent duplicate accounts with mixed casing.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Hashed password — the pre-save hook below handles hashing.
     * The raw password is never stored in the database.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    /**
     * Array of references to Job documents that the user has saved/bookmarked.
     * Populated via User.findById(...).populate('savedJobs') to return full job objects.
     */
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// ─────────────────────────────────────────────
// Pre-save Hook: Password Hashing
// ─────────────────────────────────────────────

/**
 * Before saving a user document, hash the password if it has been modified.
 * This ensures plain-text passwords are NEVER persisted to MongoDB.
 *
 * Uses bcrypt with a salt of 10 rounds — a balance between security and performance.
 */
userSchema.pre('save', async function (next) {
  // Skip hashing if the password field was not changed (e.g., updating email only)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10); // generate a cryptographic salt
  this.password = await bcrypt.hash(this.password, salt); // replace plain text with hash
  next();
});

// ─────────────────────────────────────────────
// Instance Method: Password Comparison
// ─────────────────────────────────────────────

/**
 * Compares a plain-text password candidate against the stored bcrypt hash.
 * Used during login to verify user credentials.
 *
 * @param {string} plain - The plain-text password entered by the user
 * @returns {Promise<boolean>} True if the password matches, false otherwise
 */
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Export the Mongoose model named "User" (maps to the "users" collection)
module.exports = mongoose.model('User', userSchema);
