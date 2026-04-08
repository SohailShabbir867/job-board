/**
 * @file src/pages/PostJob.jsx
 * @description Page for creating a new job listing.
 *
 * Renders a form with the following fields:
 *  - Job Title    (required)
 *  - Company      (required)
 *  - Location     (optional, defaults to "Remote")
 *  - Type         (dropdown: Full-time | Part-time | Contract | Remote | Freelance)
 *  - Salary       (optional free-text, e.g. "$60,000 – $90,000")
 *  - Description  (textarea for full job details)
 *  - Tags         (comma-separated keywords, e.g. "React, TypeScript, Remote")
 *
 * Authentication:
 *  - If the user is not logged in, an inline warning is shown and the submit
 *    button is disabled. Attempting to submit will redirect to /signin.
 *  - If the user IS logged in, the form submits to POST /api/jobs via JobsContext.addJob().
 *
 * On success: navigates to /jobs so the new listing appears immediately.
 *
 * Route: /post-job
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../context/JobsContext";
import { useAuth } from "../context/AuthContext";

/**
 * Post a job page component.
 */
export default function PostJob() {
  const navigate = useNavigate();
  const { addJob } = useJobs();   // addJob calls POST /api/jobs and updates local state
  const { user } = useAuth();     // Current authenticated user (or null)

  // ── Controlled form field state ──────────────────────────────────────────
  const [title, setTitle] = useState("");           // Required
  const [company, setCompany] = useState("");       // Required
  const [location, setLocation] = useState("");     // Optional, defaults to "Remote"
  const [type, setType] = useState("Full-time");    // Dropdown selection
  const [salary, setSalary] = useState("");         // Optional free-text
  const [description, setDescription] = useState(""); // Optional multi-line
  const [tags, setTags] = useState("");             // Optional comma-separated string

  /** Error message to display above the form (empty string = no error) */
  const [error, setError] = useState("");

  /** True while the POST /api/jobs request is in flight */
  const [loading, setLoading] = useState(false);

  // ── Submit Handler ─────────────────────────────────────────────────────────

  /**
   * Validates the form, calls addJob(), and navigates to /jobs on success.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  async function handleSubmit(e) {
    e.preventDefault(); // Prevent native browser form submission
    setError("");

    // Client-side validation for required fields
    if (!title.trim() || !company.trim()) {
      setError("Please provide a job title and company.");
      return;
    }

    // Guard: redirect unauthenticated users to sign-in
    if (!user) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      await addJob({
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || "Remote", // Default to "Remote" if blank
        type,
        salary: salary || "",
        description: description || "",
        // Parse comma-separated tags string into an array, filtering empty entries
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      // Navigate to the jobs list so the user can see their new posting
      navigate("/jobs");
    } catch (err) {
      setError(err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0 overflow-x-hidden">
      <div className="w-full px-4 sm:px-6">
        <div className="bg-[#071026] rounded-lg shadow p-6 sm:p-8 w-full border border-white/6">
          <h1 className="text-2xl font-bold mb-4 text-white">Post a Job</h1>

          {/* Auth warning — shown when the user is not logged in */}
          {!user && (
            <div id="login-required-msg" className="bg-yellow-900/30 text-yellow-300 border border-yellow-700/20 p-3 rounded mb-4 text-sm">
              You must be{" "}
              <button
                onClick={() => navigate("/signin")}
                className="underline text-yellow-200"
              >
                signed in
              </button>{" "}
              to post a job.
            </div>
          )}

          {/* Error banner — shown when submit fails */}
          {error && (
            <div className="bg-red-900/40 text-red-300 border border-red-700/20 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Job Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="e.g. Senior React Developer"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Company name"
              />
            </div>

            {/* Location, Type, Salary — 3-column grid on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Remote or City, Country"
                />
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#071026] border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                  <option>Freelance</option>
                </select>
              </div>

              {/* Salary (optional) */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Salary (optional)</label>
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="$60,000 - $90,000"
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Describe the role, responsibilities, and requirements"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Tags (comma separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="e.g. React, TypeScript, Remote"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/*
               * Submit button:
               *  - Disabled while loading or when the user is not authenticated
               *  - aria-describedby links to the auth warning banner for screen readers
               */}
              <button
                type="submit"
                disabled={loading || !user}
                aria-describedby={!user ? "login-required-msg" : undefined}
                className="bg-[#2563EB] hover:bg-[#1E40AF] disabled:opacity-50 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                {loading ? "Posting…" : "Post Job"}
              </button>

              {/* Cancel — navigates back to the jobs list without submitting */}
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="w-full sm:w-auto px-4 py-2 border border-white/10 rounded text-white bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
