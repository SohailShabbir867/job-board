/**
 * @file src/pages/Saved.jsx
 * @description Page showing the currently authenticated user's saved job listings.
 *
 * Behaviour:
 *  - Not logged in  → shows a prompt to sign in (no API call made)
 *  - Loading        → displays a spinner while the API request is in flight
 *  - Error          → displays the error message from the API
 *  - Empty list     → shows an empty-state card with a "Browse jobs" button
 *  - Has saved jobs → renders a responsive grid of job cards with a Remove button
 *
 * The "Remove" button calls DELETE /api/users/me/saved/:jobId via the unsaveJob()
 * helper and optimistically removes the job from local state on success.
 *
 * Route: /saved
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedJobs, unsaveJob } from "../api/saved";
import { useAuth } from "../context/AuthContext";

/**
 * Saved jobs page component.
 */
export default function Saved() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Current authenticated user (or null)

  /** Array of fully-populated Job documents that this user has bookmarked */
  const [saved, setSaved] = useState([]);

  /** True while the GET /api/users/me/saved request is in progress */
  const [loading, setLoading] = useState(true);

  /** Error message from the API (empty string = no error) */
  const [error, setError] = useState("");

  // ── Fetch saved jobs on mount / when the user changes ─────────────────────
  useEffect(() => {
    // Skip the API call if the user is not authenticated
    if (!user) { setLoading(false); return; }

    getSavedJobs()
      .then(setSaved)
      .catch((err) => setError(err.message || "Failed to load saved jobs"))
      .finally(() => setLoading(false));
  }, [user]); // Re-run whenever the logged-in user changes (login / logout)

  // ── Unsave handler ─────────────────────────────────────────────────────────

  /**
   * Remove a job from the user's saved list.
   * Asks for confirmation, calls the API, then removes the job from local state.
   *
   * @param {string} jobId - MongoDB _id of the job to unsave
   */
  async function handleUnsave(jobId) {
    if (!window.confirm("Remove from saved jobs?")) return; // Guard against accidents

    try {
      await unsaveJob(jobId); // DELETE /api/users/me/saved/:jobId
      // Optimistically update local state — no need for a full re-fetch
      setSaved((prev) => prev.filter((j) => String(j._id) !== String(jobId)));
    } catch (err) {
      alert(err.message || "Failed to remove job");
    }
  }

  // ── Conditional render states ─────────────────────────────────────────────

  /** Not authenticated — show a sign-in prompt */
  if (!user) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0">
        <div className="w-full px-4 sm:px-6">
          <div className="bg-[#071026] p-6 rounded-lg shadow text-center w-full border border-white/6">
            <h2 className="text-xl font-bold mb-2 text-white">Sign in to see saved jobs</h2>
            <p className="text-gray-300 mb-4">You need to be signed in to save and view saved jobs.</p>
            <button onClick={() => navigate("/signin")} className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded">
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** Loading state — show a spinner */
  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  /** API error — show the error message */
  if (error) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] text-white p-6">
        <div className="bg-red-900/20 text-red-300 p-4 rounded">{error}</div>
      </div>
    );
  }

  /** Empty saved list — show an empty-state message */
  if (!saved.length) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0">
        <div className="w-full px-4 sm:px-6">
          <div className="bg-[#071026] p-6 rounded-lg shadow text-center w-full border border-white/6">
            <h2 className="text-xl font-bold mb-2 text-white">No saved jobs</h2>
            <p className="text-gray-300 mb-4">Save jobs from the listings to view them here later.</p>
            <button onClick={() => navigate("/jobs")} className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded">
              Browse jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render — responsive grid of saved job cards ────────────────────
  return (
    <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0">
      <div className="w-full px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-4 text-white">Saved Jobs</h1>

        {/* Responsive card grid: 1 column on mobile, 2 on sm, 3 on lg */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((job) => (
            <div key={job._id} className="bg-[#071026] p-4 rounded-lg shadow border border-white/6">
              {/* Job title */}
              <h3 className="font-semibold text-white">{job.title}</h3>

              {/* Company name in brand blue */}
              <p className="text-sm text-[#60a5fa]">{job.company}</p>

              {/* Location and employment type */}
              <p className="text-xs text-gray-400">{job.location} · {job.type}</p>

              {/* Truncated job description (3 lines max) */}
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">{job.description}</p>

              {/* Salary — only rendered when present */}
              {job.salary && (
                <p className="text-xs font-mono text-gray-300 mt-1">{job.salary}</p>
              )}

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                {/*
                 * Remove button:
                 * aria-label includes the job title so screen reader users know
                 * exactly which job will be removed.
                 */}
                <button
                  onClick={() => handleUnsave(job._id)}
                  aria-label={`Remove ${job.title} from saved jobs`}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
