/**
 * @file src/pages/Register.jsx
 * @description User registration page.
 *
 * Renders a form for creating a new account:
 *  - Full name
 *  - Email address
 *  - Password (minimum 6 characters)
 *  - Confirm password
 *
 * On successful registration:
 *  - Calls AuthContext.register() which POSTs to /api/auth/register
 *  - The API returns a JWT which is stored in localStorage
 *  - The user is redirected to the home page ("/")
 *
 * Client-side validation checks:
 *  1. All fields filled
 *  2. Password length >= 6 characters
 *  3. Password and confirm-password match
 *
 * Route: /register
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Registration page component.
 */
export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth(); // Register action from AuthContext

  /** Form field values managed as a single state object */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pwConfirm: "", // Confirm-password field (not sent to the API)
  });

  /** True while the registration API request is in progress */
  const [loading, setLoading] = useState(false);

  /** Error message to display at the top of the form (empty string = no error) */
  const [error, setError] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Generic change handler — updates the corresponding field in formData state.
   * Using a single handler for all inputs avoids four separate setter functions.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * Form submission handler.
   * Validates client-side rules, calls the register API, and redirects on success.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  async function handleRegister(e) {
    e.preventDefault(); // Prevent native browser form submission
    setError("");

    const { name, email, password, pwConfirm } = formData;

    // ── Client-side validation ──────────────────────────────────────────────
    if (!name || !email || !password || !pwConfirm) {
      setError("Please fill all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== pwConfirm) {
      setError("Passwords do not match.");
      return;
    }

    // ── API call ────────────────────────────────────────────────────────────
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      // Redirect to home with replace so the user can't go "back" to the register form
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-[#050b1b] p-4 overflow-x-hidden">
      <div className="w-full" style={{ width: '99%', maxWidth: 420, margin: '0 auto' }}>
        <div className="bg-[#071026] rounded-xl shadow-lg p-6 border border-white/6 w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
          <p className="text-sm text-gray-300 mb-6">Register to post jobs and save listings.</p>

          {/* Error banner — shown only when there is an error */}
          {error && (
            <div className="bg-red-900/40 text-red-300 border border-red-700/20 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <label className="block">
              <span className="text-sm text-gray-300">Full name</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full bg-[#071026] border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-gray-400"
                placeholder="Your name"
                required
              />
            </label>

            {/* Email */}
            <label className="block">
              <span className="text-sm text-gray-300">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full bg-[#071026] border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-gray-400"
                placeholder="you@company.com"
                required
              />
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm text-gray-300">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full bg-[#071026] border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-gray-400"
                placeholder="Choose a password"
                required
              />
            </label>

            {/* Confirm Password */}
            <label className="block">
              <span className="text-sm text-gray-300">Confirm password</span>
              <input
                type="password"
                name="pwConfirm"
                value={formData.pwConfirm}
                onChange={handleChange}
                className="mt-1 w-full bg-[#071026] border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-gray-400"
                placeholder="Repeat password"
                required
              />
            </label>

            {/* Submit button — disabled while the API request is in progress */}
            <button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-md font-medium">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          {/* Link to sign-in page for existing users */}
          <div className="mt-6 text-sm text-gray-300">
            Already have an account?{" "}
            <Link to="/signin" className="text-[#60a5fa] hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
