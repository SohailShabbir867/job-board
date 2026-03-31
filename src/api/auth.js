/**
 * @file src/api/auth.js
 * @description Authentication API service functions.
 *
 * Provides thin wrappers around the Express /api/auth/* endpoints.
 * All functions use the shared `request` client which handles:
 *  - Base URL resolution
 *  - JSON headers
 *  - JWT attachment
 *  - Error propagation
 *
 * Token persistence:
 *  - After a successful register or login the returned JWT is stored in
 *    localStorage under the key "token".
 *  - `logoutUser` removes that token, immediately invalidating future requests.
 */

import request from './client';

/**
 * Register a new user account.
 *
 * Sends credentials to POST /api/auth/register.
 * On success, stores the returned JWT in localStorage so subsequent API calls
 * are automatically authenticated (via client.js's getToken()).
 *
 * @param {{ name: string, email: string, password: string }} params - New user details
 * @returns {Promise<{ id: string, name: string, email: string }>} The created user object
 * @throws {Error} If the email is already registered or validation fails
 */
export async function register({ name, email, password }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  // Persist the JWT so the session survives page refreshes
  if (data.token) localStorage.setItem('token', data.token);

  return data.user; // Return only the safe user object (no token exposed to callers)
}

/**
 * Log in with an existing account.
 *
 * Sends credentials to POST /api/auth/login.
 * On success, stores the returned JWT in localStorage.
 *
 * @param {string} email    - User's email address
 * @param {string} password - User's plain-text password
 * @returns {Promise<{ id: string, name: string, email: string }>} The authenticated user
 * @throws {Error} If the credentials are invalid (401) or a server error occurs (500)
 */
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store the new JWT — replaces any previously stored token
  if (data.token) localStorage.setItem('token', data.token);

  return data.user;
}

/**
 * Fetch the currently authenticated user's profile.
 *
 * Calls GET /api/auth/me using the JWT that is automatically injected by client.js.
 * Used on application startup to restore the user session from a stored token.
 *
 * @returns {Promise<{ id: string, name: string, email: string }>} Current user info
 * @throws {Error} If the token is missing, expired, or invalid (401)
 */
export async function getMe() {
  return request('/auth/me');
}

/**
 * Log out the current user by clearing the stored JWT.
 *
 * After calling this function, all subsequent API requests made via client.js
 * will be unauthenticated (no Authorization header).
 *
 * Note: This is a client-side logout only — no server-side token invalidation
 * is performed because JWTs are stateless. The token simply expires naturally.
 */
export function logoutUser() {
  try {
    localStorage.removeItem('token');
  } catch {
    // ignore storage errors (e.g. private browsing mode)
  }
}
