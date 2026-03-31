/**
 * @file src/api/jobs.js
 * @description Job listing API service functions.
 *
 * Wraps the Express /api/jobs/* endpoints and returns typed promises.
 * Write operations (createJob, deleteJob) require a JWT token to be present
 * in localStorage; the client.js wrapper handles header injection automatically.
 *
 * These functions are consumed primarily by JobsContext.jsx and JobsDetail.jsx.
 */

import request from './client';

/**
 * Retrieve all job listings from the database.
 * Results are sorted newest-first by the API.
 *
 * @returns {Promise<Array>} Array of Job documents (each includes populated `postedBy`)
 */
export function getJobs() {
  return request('/jobs'); // GET /api/jobs — no auth required
}

/**
 * Retrieve a single job listing by its MongoDB ObjectId.
 *
 * @param {string} id - The job's MongoDB _id (hex string)
 * @returns {Promise<Object>} The Job document with populated `postedBy`
 * @throws {Error} If the job is not found (404) or a server error occurs
 */
export function getJob(id) {
  return request(`/jobs/${id}`); // GET /api/jobs/:id — no auth required
}

/**
 * Create a new job listing. Requires the user to be authenticated (JWT in localStorage).
 *
 * @param {{
 *   title: string,
 *   company: string,
 *   location?: string,
 *   type?: string,
 *   salary?: string,
 *   description?: string,
 *   tags?: string[]
 * }} jobData - The job details to submit
 * @returns {Promise<Object>} The newly created Job document
 * @throws {Error} If the user is not authenticated (401) or validation fails (400)
 */
export function createJob(jobData) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData), // Serialise the job data as JSON
  });
}

/**
 * Delete a job listing. The authenticated user must be the original poster.
 *
 * @param {string} id - The MongoDB _id of the job to delete
 * @returns {Promise<{ message: string }>} Confirmation message object
 * @throws {Error} If not authenticated (401), not the owner (403), or job not found (404)
 */
export function deleteJob(id) {
  return request(`/jobs/${id}`, { method: 'DELETE' }); // DELETE /api/jobs/:id
}
