/**
 * @file src/api/saved.js
 * @description Saved jobs API service functions.
 *
 * Wraps the Express /api/users/me/saved/* endpoints.
 * All three functions require an authenticated user (JWT in localStorage).
 * The client.js wrapper automatically attaches the Bearer token.
 *
 * These functions are consumed by Jobs.jsx, Saved.jsx, and JobsDetail.jsx
 * to sync the user's bookmarked jobs with the MongoDB backend.
 */

import request from './client';

/**
 * Retrieve the list of jobs the currently authenticated user has saved.
 * The API returns fully populated Job documents (not just IDs).
 *
 * @returns {Promise<Array>} Array of saved Job documents
 * @throws {Error} If the user is not authenticated (401)
 */
export function getSavedJobs() {
  return request('/users/me/saved'); // GET /api/users/me/saved
}

/**
 * Bookmark a job listing for the currently authenticated user.
 *
 * @param {string} jobId - MongoDB _id of the job to save
 * @returns {Promise<{ message: string }>} Confirmation object, e.g. { message: "Job saved" }
 * @throws {Error} If not authenticated (401), job not found (404), or already saved (400)
 */
export function saveJob(jobId) {
  return request(`/users/me/saved/${jobId}`, { method: 'POST' }); // POST /api/users/me/saved/:jobId
}

/**
 * Remove a bookmarked job from the current user's saved list.
 * Does NOT delete the job listing itself — only removes the user's reference.
 *
 * @param {string} jobId - MongoDB _id of the job to unsave
 * @returns {Promise<{ message: string }>} Confirmation object, e.g. { message: "Job removed from saved" }
 * @throws {Error} If not authenticated (401)
 */
export function unsaveJob(jobId) {
  return request(`/users/me/saved/${jobId}`, { method: 'DELETE' }); // DELETE /api/users/me/saved/:jobId
}
