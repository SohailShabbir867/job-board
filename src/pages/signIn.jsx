// src/pages/signIn.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already signed in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-[#050b1b] p-4 overflow-x-hidden">
      <div className="w-full" style={{ width: '99%', maxWidth: 420, margin: '0 auto' }}>
        <div className="bg-[#071026] rounded-xl shadow-lg p-6 border border-white/6 w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Sign in</h2>
          <p className="text-sm text-gray-300 mb-6">
            Welcome back — sign in to manage postings and saved jobs.
          </p>

          {error && (
            <div className="bg-red-900/40 text-red-300 border border-red-700/20 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center justify-end">
              <Link to="/register" className="text-sm text-[#60a5fa] hover:underline">
                Create account
              </Link>
            </div>

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
