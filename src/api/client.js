/**
 * @file src/api/client.js
 * @description Base HTTP client for the Job Board frontend.
 *
 * This module provides a single `request()` helper that wraps the native
 * `fetch` API and:
 *  - Reads the base API URL from the VITE_API_URL env variable (defaults to "/api"
 *    so the Vite dev-server proxy forwards requests to the Express backend).
 *  - Automatically attaches a `Content-Type: application/json` header.
 *  - Reads the JWT access token from localStorage and injects it as an
 *    `Authorization: Bearer <token>` header when present.
 *  - Parses the JSON response body.
 *  - Throws a descriptive `Error` when the HTTP response is not OK (4xx / 5xx).
 *
 * All API service modules (auth.js, jobs.js, saved.js) import and use
 * this helper rather than calling fetch directly.
 */

/** Base URL for all API requests. Reads the Vite env variable if set. */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Safely reads the JWT token from localStorage.
 * Returns an empty string if localStorage is unavailable (SSR / private mode).
 *
 * @returns {string} The stored JWT token or an empty string
 */
function getToken() {
  try {
    return localStorage.getItem('token') || '';
  } catch {
    // localStorage may be unavailable in certain contexts (e.g. private browsing)
    return '';
  }
}

/**
 * Performs an authenticated HTTP request to the Job Board API.
 *
 * @param {string} path     - API path relative to BASE_URL, e.g. "/jobs" or "/auth/login"
 * @param {RequestInit} [options={}] - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}  Resolves with the parsed JSON response body
 * @throws {Error}          Rejects with the server's error message when res.ok is false
 *
 * @example
 * // GET all jobs (no body, no special headers)
 * const jobs = await request('/jobs');
 *
 * @example
 * // POST to create a job (automatically attaches JWT + JSON headers)
 * const job = await request('/jobs', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'Engineer', company: 'Acme' }),
 * });
 */
async function request(path, options = {}) {
  const token = getToken();

  // Build the final headers object:
  //  1. Always set Content-Type to JSON
  //  2. Attach the JWT Authorization header only when a token exists
  //  3. Merge any extra headers passed by the caller (caller headers take precedence)
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Execute the fetch request with the merged options
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Parse the JSON body regardless of status so we can read the error message
  const data = await res.json();

  // Throw a descriptive error for non-2xx responses
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export default request;
