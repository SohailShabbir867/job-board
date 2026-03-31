/**
 * @file src/context/AuthContext.jsx
 * @description React context for authentication state management.
 *
 * AuthContext / AuthProvider:
 *  - Holds the currently logged-in user object (or null when logged out).
 *  - Restores a previous session on app mount by calling GET /api/auth/me
 *    if a JWT is present in localStorage.
 *  - Exposes login(), register(), and logout() actions that components can
 *    call without knowing the underlying API details.
 *
 * Usage:
 *   // Wrap your app in AuthProvider (done in App.jsx):
 *   <AuthProvider>...</AuthProvider>
 *
 *   // Consume auth state in any child component:
 *   const { user, login, logout, authLoading } = useAuth();
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logoutUser,
} from "../api/auth";

/**
 * The raw React context object.
 * Prefer using the `useAuth()` hook rather than consuming this directly.
 */
const AuthContext = createContext();

// ─────────────────────────────────────────────
// AuthProvider Component
// ─────────────────────────────────────────────

/**
 * Context provider that wraps the application and supplies auth state to all descendants.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  /** The authenticated user object ({ id, name, email }) or null if logged out */
  const [user, setUser] = useState(null);

  /**
   * True while the initial session-restore fetch is in progress.
   * Components should show a loading indicator (or render nothing) while this is true
   * to avoid rendering the wrong authenticated/unauthenticated UI state.
   */
  const [authLoading, setAuthLoading] = useState(true);

  // ── Session Restore on Mount ──────────────────────────────────────────────
  /**
   * On first render, check whether a JWT is already stored in localStorage.
   * If so, validate it by calling GET /api/auth/me and restore the user session.
   * This keeps the user logged in across page refreshes without re-entering credentials.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then(setUser)                                     // session valid → set user
        .catch(() => localStorage.removeItem("token"))    // token expired/invalid → clear it
        .finally(() => setAuthLoading(false));             // loading complete either way
    } else {
      // No token stored — user is definitely not logged in
      setAuthLoading(false);
    }
  }, []); // Empty dependency array: runs once on mount only

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Log in with email and password.
   * Calls POST /api/auth/login, stores the returned JWT, and updates context state.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} The authenticated user object
   * @throws {Error} Propagates API errors (invalid credentials, server errors)
   */
  const login = async (email, password) => {
    const userData = await apiLogin(email, password);
    setUser(userData); // Update the React state so the UI re-renders immediately
    return userData;
  };

  /**
   * Register a new account and immediately log in.
   * Calls POST /api/auth/register, stores the JWT, and updates context state.
   *
   * @param {{ name: string, email: string, password: string }} params
   * @returns {Promise<Object>} The newly created user object
   * @throws {Error} Propagates API errors (duplicate email, validation errors)
   */
  const register = async ({ name, email, password }) => {
    const userData = await apiRegister({ name, email, password });
    setUser(userData); // Log the user in immediately after successful registration
    return userData;
  };

  /**
   * Log out the current user.
   * Removes the JWT from localStorage and clears the user from context state.
   */
  const logout = () => {
    logoutUser();  // Remove JWT from localStorage
    setUser(null); // Clear user state → triggers re-render to unauthenticated UI
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// useAuth Hook
// ─────────────────────────────────────────────

/**
 * Custom hook for consuming AuthContext.
 * Must be used inside a component that is a descendant of <AuthProvider>.
 *
 * @returns {{ user: Object|null, authLoading: boolean, login: Function, register: Function, logout: Function }}
 *
 * @example
 * function NavBar() {
 *   const { user, logout } = useAuth();
 *   return user ? <button onClick={logout}>Logout</button> : <Link to="/signin">Sign in</Link>;
 * }
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
