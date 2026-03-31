// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pwConfirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const { name, email, password, pwConfirm } = formData;

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

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-[#050b1b] p-4 overflow-x-hidden">
      <div className="w-full" style={{ width: '99%', maxWidth: 420, margin: '0 auto' }}>
        <div className="bg-[#071026] rounded-xl shadow-lg p-6 border border-white/6 w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
          <p className="text-sm text-gray-300 mb-6">Register to post jobs and save listings.</p>

          {error && (
            <div className="bg-red-900/40 text-red-300 border border-red-700/20 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
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

            <button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-md font-medium">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-300">
            Already have an account?{" "}
            <Link to="/signin" className="text-[#60a5fa] hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
