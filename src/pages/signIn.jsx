/**
 * @file src/pages/signIn.jsx
 * @description Sign-in (login) page.
 *
 * Renders a login form that:
 *  - Accepts an email address and password
 *  - Calls AuthContext.login() on submit, which POSTs to /api/auth/login
 *  - Stores the returned JWT in localStorage (handled by api/auth.js)
 *  - Redirects to the home page on success
 *  - Redirects away if the user is already logged in (via useEffect)
 *
 * Route: /signin
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Sign-in page component.
 */
export default function SignIn() {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // login action + current auth state from context

  /** Controlled form values for email and password */
  const [formData, setFormData] = useState({ email: "", password: "" });

  /** True while the login API call is in flight */
  const [loading, setLoading] = useState(false);

  /** Holds an error message to display; empty string = no error */
  const [error, setError] = useState("");

  // ── Already signed in? Redirect to home ─────────────────────────────────
  /**
   * If the user is already authenticated (e.g. they navigated here manually
   * after a session was restored from localStorage), send them to the home page.
   */
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Generic change handler for both the email and password inputs.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * Form submission handler.
   * Calls the login API action and navigates home on success.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  async function handleSubmit(e) {
    e.preventDefault(); // Prevent full-page form submission
    setError("");
    setLoading(true);
    try {
      // Trim whitespace from email before sending (password should not be trimmed)
      await login(formData.email.trim(), formData.password);
      navigate("/"); // Redirect to home page on successful login
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-[#050b1b] p-4 overflow-x-hidden">
      <div className="w-full" style={{ width: '99%', maxWidth: 420, margin: '0 auto' }}>
        <div className="bg-[#071026] rounded-xl shadow-lg p-6 border border-white/6 w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Sign in</h2>
          <p className="text-sm text-gray-300 mb-6">
            Welcome back — sign in to manage postings and saved jobs.
          </p>

          {/* Error banner — only rendered when there is an error message */}
          {error && (
            <div className="bg-red-900/40 text-red-300 border border-red-700/20 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <label className="block">
              <span className="text-sm text-gray-300">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                required
                onChange={handleChange}
                className="mt-1 w-full bg-[#071026] border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-gray-400"
                placeholder="you@company.com"
              />
            </label>

            {/* Password field */}
            <label className="block">
              <span className="text-sm text-gray-300">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                required
                onChange={handleChange}
                className="mt-1 w-full bg-[#071026] border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-gray-400"
                placeholder="••••••••"
              />
            </label>

            {/* Link to register page for new users */}
            <div className="flex items-center justify-end">
              <Link to="/register" className="text-sm text-[#60a5fa] hover:underline">
                Create account
              </Link>
            </div>

            {/* Submit button — disabled while the API request is in progress */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-md font-medium"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
