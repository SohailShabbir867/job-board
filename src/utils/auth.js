/**
 * @file src/utils/auth.js
 * @description Legacy client-side auth utilities stub — kept for historical reference.
 *
 * ⚠️  DEPRECATED: This file is NOT used anywhere in the application.
 *      The production application uses JWT-based authentication via the
 *      Express/MongoDB backend. See src/api/auth.js and AuthContext.jsx.
 *
 * The original frontend-only implementation stored user accounts entirely in
 * localStorage. That approach was removed during the MERN migration because:
 *  - Plain-text passwords cannot be stored safely in a browser
 *  - Data was isolated to a single browser/device
 *  - There was no real server-side authorisation
 *
 * All auth actions are now handled by:
 *  - Backend: backend/routes/auth.js (bcrypt hashing, JWT issuance)
 *  - Frontend context: src/context/AuthContext.jsx
 *  - Frontend API layer: src/api/auth.js
 */

/**
 * @deprecated Authentication is now handled by the Express backend with bcrypt +
 *   JWT. Do not use or re-introduce localStorage-based auth.
 *
 * Stub exported so any accidental import does not cause a runtime crash.
 */
export function registerUser() {
  throw new Error(
    'registerUser() is deprecated. Use AuthContext.register() instead.'
  );
}

/**
 * @deprecated Authentication is now handled by the Express backend with bcrypt +
 *   JWT. Do not use or re-introduce localStorage-based auth.
 */
export function loginUser() {
  throw new Error(
    'loginUser() is deprecated. Use AuthContext.login() instead.'
  );
}

/**
 * @deprecated Use AuthContext.logout() instead.
 */
export function logout() {
  throw new Error('logout() is deprecated. Use AuthContext.logout() instead.');
}

/**
 * @deprecated Use AuthContext.useAuth().user instead.
 */
export function getCurrentUser() {
  throw new Error(
    'getCurrentUser() is deprecated. Use the useAuth() hook instead.'
  );
}
