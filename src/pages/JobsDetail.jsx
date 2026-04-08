/**
 * @file src/pages/JobsDetail.jsx
 * @description Standalone detail page for a single job listing.
 *
 * Reads the job :id from the URL params, fetches the job document from the API,
 * and renders a two-column layout with:
 *  - Left: full job description and skill tags
 *  - Right: company info sidebar with save / delete / back buttons
 *
 * Behaviour:
 *  - On mount (or when the route id changes) the job is fetched via GET /api/jobs/:id
 *  - If the user is logged in, their saved-jobs list is also fetched so the
 *    "Save for later" button reflects the correct saved state.
 *  - The delete button is only rendered for the user who originally posted the job.
 *
 * Route: /jobs/:id
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob } from "../api/jobs";
import { saveJob, unsaveJob, getSavedJobs } from "../api/saved";
import { useAuth } from "../context/AuthContext";
import { useJobs } from "../context/JobsContext";

/**
 * Job detail page component.
 */
export default function JobsDetail() {
  // ── Route params + navigation ─────────────────────────────────────────────
  const { id } = useParams();   // MongoDB _id from the URL, e.g. /jobs/64b3c...
  const navigate = useNavigate();

  // ── Auth + jobs context ───────────────────────────────────────────────────
  const { user } = useAuth();       // Current authenticated user (or null)
  const { removeJob } = useJobs();  // Delete job and update global list

  // ── Local state ───────────────────────────────────────────────────────────
  /** The fetched Job document (null before the API responds) */
  const [job, setJob] = useState(null);

  /** Whether this job is in the current user's saved list */
  const [savedFlag, setSavedFlag] = useState(false);

  /** True while the initial API request(s) are in flight */
  const [loading, setLoading] = useState(true);

  /** Error message if the job could not be fetched */
  const [error, setError] = useState("");

  // ── Fetch job + saved status ──────────────────────────────────────────────

  /**
   * Whenever the job id or the logged-in user changes:
   *  1. Fetch the job document from GET /api/jobs/:id
   *  2. If the user is authenticated, check whether this job is already saved
   */
  useEffect(() => {
    getJob(id)
      .then((data) => {
        setJob(data);
        // Only check saved status when the user is logged in
        if (user) {
          getSavedJobs()
            .then((list) =>
              setSavedFlag(list.some((j) => String(j._id) === String(data._id)))
            )
            .catch(() => {
              // Ignore errors from the saved-jobs check; the page still renders
            });
        }
      })
      .catch(() => setError("Job not found"))
      .finally(() => setLoading(false));
  }, [id, user]); // Re-run if the URL id changes or the user logs in/out

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Toggle the saved state of the current job.
   * Redirects to /signin if the user is not authenticated.
   */
  async function toggleSave() {
    if (!user) { navigate("/signin"); return; }

    if (savedFlag) {
      await unsaveJob(job._id);  // DELETE /api/users/me/saved/:id
      setSavedFlag(false);
    } else {
      await saveJob(job._id);    // POST /api/users/me/saved/:id
      setSavedFlag(true);
    }
  }

  /**
   * Delete this job listing.
   * Only the original poster can call this (ownership enforced server-side).
   * On success, navigates back to the jobs list.
   */
  async function handleDelete() {
    if (!window.confirm("Delete your post?")) return;
    try {
      await removeJob(job._id); // DELETE /api/jobs/:id via JobsContext
      navigate("/jobs");
    } catch (err) {
      alert(err.message || "Failed to delete");
    }
  }

  // ── Conditional render states ─────────────────────────────────────────────

  /** Loading spinner */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  /** Error / not found */
  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-3">Job not found</h2>
          <p className="mb-4 text-gray-600">The job might have been removed.</p>
          <button onClick={() => navigate("/jobs")} className="bg-[#2563EB] text-white px-4 py-2 rounded">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  /**
   * Check whether the currently logged-in user is the one who posted this job.
   * Used to conditionally render the "Delete post" button.
   */
  const isOwner = user && job.postedBy &&
    (String(job.postedBy._id || job.postedBy) === String(user.id));

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded shadow overflow-hidden">

        {/* ── Header gradient banner with title and company ───────────── */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white p-6">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-sm text-blue-100 mt-1">{job.company}</p>
        </div>

        {/* ── Two-column body ────────────────────────────────────────── */}
        <div className="p-6 grid md:grid-cols-3 gap-6">

          {/* ── Main column: description + tags ─────────────────────── */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-700">Job Description</h3>
            <p className="text-gray-600">{job.description}</p>

            {/* Skill / technology tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((t, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar: company info + action buttons ───────────────── */}
          <aside className="space-y-4">
            {/* Company details card */}
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-700">Company</h4>
              <p className="text-sm text-gray-800">{job.company}</p>
              <p className="text-xs text-gray-500 mt-2">Location</p>
              <p className="text-sm text-gray-800">{job.location}</p>
              <p className="text-xs text-gray-500 mt-2">Type</p>
              <p className="text-sm text-gray-800">{job.type}</p>
              <p className="text-xs text-gray-500 mt-2">Salary</p>
              <p className="text-sm text-gray-800">{job.salary || "—"}</p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Save / unsave toggle button */}
              <button
                onClick={toggleSave}
                className={`w-full py-2 rounded ${savedFlag ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                {savedFlag ? "Saved ✓" : "Save for later"}
              </button>

              {/* Delete button — only visible to the job's original poster */}
              {isOwner && (
                <button onClick={handleDelete} className="w-full bg-red-100 text-red-700 py-2 rounded">
                  Delete post
                </button>
              )}

              {/* Back to jobs list */}
              <button onClick={() => navigate("/jobs")} className="w-full bg-gray-200 text-gray-700 py-2 rounded">
                ← Back to Jobs
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
