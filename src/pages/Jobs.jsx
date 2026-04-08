/**
 * @file src/pages/Jobs.jsx
 * @description Main job listings page.
 *
 * Features:
 *  - Displays all job postings fetched from MongoDB in a responsive card grid
 *  - "Refresh" button triggers a manual re-fetch via JobsContext.fetchJobs()
 *  - "Save / Unsave" toggling per job (requires auth; redirects to /signin if not)
 *  - "Delete" button visible only to the job's original poster
 *  - "View Details" button opens an in-page modal overlay with full job info
 *  - Modal can be closed with the Escape key (keyboard accessible)
 *  - Employment type badge is colour-coded by job type
 *  - Save errors are surfaced as a non-blocking notification bar
 *
 * Route: /jobs
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../context/JobsContext";
import { useAuth } from "../context/AuthContext";
import { saveJob, unsaveJob, getSavedJobs } from "../api/saved";

/**
 * Jobs listing page component.
 */
export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, loading, error, fetchJobs, removeJob } = useJobs(); // from JobsContext
  const { user } = useAuth(); // current authenticated user (or null)

  // ── Saved state ──────────────────────────────────────────────────────────
  /** Set of job _id strings that the user has saved (for O(1) lookups) */
  const [savedIds, setSavedIds] = useState(new Set());

  /** _id of the job currently being saved/unsaved (shows loading state per button) */
  const [savingId, setSavingId] = useState(null);

  /** Error message when a save/unsave API call fails (displayed as a top banner) */
  const [saveError, setSaveError] = useState("");

  // ── Modal state ───────────────────────────────────────────────────────────
  /** Whether the job detail modal overlay is open */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** The job object to display in the modal (null when the modal is closed) */
  const [modalJob, setModalJob] = useState(null);

  // ── Load saved IDs when user changes ─────────────────────────────────────
  /**
   * Fetch the user's saved job IDs from the API whenever the authenticated user
   * changes (login / logout). We store only the _id values in a Set for fast
   * O(1) "is this job saved?" lookups when rendering each card.
   */
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    getSavedJobs()
      .then((list) => setSavedIds(new Set(list.map((j) => String(j._id)))))
      .catch(() => setSavedIds(new Set())); // ignore errors — savedIds just stays empty
  }, [user]);

  // ── Keyboard: close modal on Escape ──────────────────────────────────────
  useEffect(() => {
    if (!isModalOpen) return; // Only add the listener when the modal is open
    function onKey(e) { if (e.key === "Escape") setIsModalOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey); // cleanup
  }, [isModalOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Toggle the saved state of a job for the current user.
   * Redirects unauthenticated users to the sign-in page.
   *
   * @param {Object} job - The Job document to save/unsave
   */
  async function handleSave(job) {
    if (!user) { navigate("/signin"); return; }

    const jobId = String(job._id);
    setSavingId(jobId);  // Mark this specific button as loading
    setSaveError("");    // Clear any previous save error

    try {
      if (savedIds.has(jobId)) {
        // Job is already saved → unsave it
        await unsaveJob(jobId);
        setSavedIds((prev) => {
          const s = new Set(prev);
          s.delete(jobId);
          return s;
        });
      } else {
        // Job is not saved → save it
        await saveJob(jobId);
        setSavedIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err) {
      // Surface the error to the user as a dismissible banner
      setSaveError(err.message || "Failed to update saved jobs");
    } finally {
      setSavingId(null); // Clear the per-button loading state
    }
  }

  /**
   * Delete a job listing after user confirmation.
   * Closes the modal if the deleted job is currently shown in it.
   *
   * @param {string} jobId - MongoDB _id of the job to delete
   */
  async function handleDelete(jobId) {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await removeJob(jobId); // DELETE /api/jobs/:id via JobsContext
      // Close the modal if the deleted job was being viewed
      if (modalJob && String(modalJob._id) === String(jobId)) setIsModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  }

  /**
   * Open the job detail modal for the given job.
   *
   * @param {Object} job - The Job document to preview in the modal
   */
  function viewDetails(job) {
    setModalJob(job);
    setIsModalOpen(true);
  }

  /**
   * Check whether the current user is the original poster of a job.
   * Used to conditionally render the "Delete" button on each card.
   *
   * @param {Object} job - Job document (must have a `postedBy` field)
   * @returns {boolean}
   */
  const isOwner = (job) => user && job.postedBy && (
    String(job.postedBy._id || job.postedBy) === String(user.id)
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-screen bg-[#050b1b] text-white m-0 p-0 overflow-x-hidden flex flex-col items-stretch">

      {/* ── Sub-header with Refresh button ──────────────────────────────── */}
      <header className="bg-[#050b1b] text-white w-full m-0 p-0 sticky top-0 z-40 shadow">
        <div className="w-full px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3" style={{ width: '99%', margin: '0 auto' }}>
          <div className="w-full md:w-auto flex justify-end">
            {/* Manual refresh button — triggers a new GET /api/jobs request */}
            <button
              onClick={() => fetchJobs()}
              className="bg-white text-[#2563EB] px-3 py-2 rounded-md text-sm border"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content area ────────────────────────────────────────────── */}
      <main className="w-full m-0 p-0">
        <div
          className="w-full px-0 py-6"
          style={{
            width: '99%',
            margin: '0 auto',
            // Subtle radial gradients + dark background for depth
            backgroundImage: `radial-gradient(circle at 10% 10%, rgba(37,99,235,0.06), transparent 12%),
                              radial-gradient(circle at 90% 80%, rgba(59,130,246,0.04), transparent 18%),
                              linear-gradient(180deg, rgba(5,11,27,0.98), rgba(5,11,27,0.95))`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: 'cover',
          }}
        >
          {/* Save error notification banner (dismisses on next save attempt) */}
          {saveError && (
            <div className="mx-4 mb-4 bg-red-900/30 text-red-300 border border-red-700/20 p-3 rounded text-sm">
              {saveError}
            </div>
          )}

          {/* Page heading + results count */}
          <div className="flex items-center justify-center mb-6 px-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Job Listings</h2>
              <div className="text-sm text-gray-300 mt-1">{jobs.length} results</div>
            </div>
          </div>

          {/* ── Content states ─────────────────────────────────────────── */}
          {loading ? (
            // Loading spinner
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
            </div>
          ) : error ? (
            // API error message
            <div className="bg-red-50/10 border border-red-600/20 p-4 rounded text-red-300 mx-4">{error}</div>
          ) : jobs.length === 0 ? (
            // Empty state — prompt the user to post the first job
            <div className="text-center text-gray-400 py-16 px-4">
              <p className="text-lg mb-4">No jobs posted yet.</p>
              <button
                onClick={() => navigate("/post-job")}
                className="bg-[#2563EB] text-white px-4 py-2 rounded-md"
              >
                Post the first job
              </button>
            </div>
          ) : (
            // ── Job card grid ─────────────────────────────────────────────
            // Responsive: 1 col → 2 → 3 → 4 → 5 depending on viewport width
            <div className="grid gap-4 px-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
              {jobs.map((job) => {
                const jobId = String(job._id);
                const savedFlag = savedIds.has(jobId); // Is this job saved by the user?
                const owner = isOwner(job);            // Is the current user the poster?
                return (
                  <article
                    key={jobId}
                    className="bg-[#071026] border border-white/6 p-4 sm:p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col h-full min-h-[260px] overflow-hidden relative"
                  >
                    {/* Card header: title, company, location + type badge */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 pr-2 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight truncate">{job.title}</h3>
                        <p className="text-sm text-[#60a5fa] font-medium mt-1 truncate">{job.company}</p>
                        <p className="text-xs text-gray-400 mt-1">{job.location} · {job.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0 mt-3 sm:mt-0">
                        {/* "Your post" badge — only shown to the poster */}
                        {owner && (
                          <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full whitespace-nowrap">Your post</span>
                        )}
                        {/* Colour-coded employment type badge */}
                        <span className={`text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                          job.type === "Full-time"  ? "bg-green-100 text-green-700"   :
                          job.type === "Part-time"  ? "bg-orange-100 text-orange-700" :
                          job.type === "Contract"   ? "bg-purple-100 text-purple-700" :
                          job.type === "Remote"     ? "bg-indigo-800 text-indigo-200" :
                          "bg-indigo-100 text-indigo-700" // Freelance + default
                        }`}>{job.type}</span>
                      </div>
                    </div>

                    {/* Skill / technology tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.tags.map((t, i) => (
                          <span key={i} className="bg-white/6 text-gray-300 px-2 py-1 rounded-full text-xs">{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Truncated description (3 lines max to keep cards uniform height) */}
                    <p className="text-sm text-gray-300 mt-3 line-clamp-3">{job.description}</p>

                    {/* Card action buttons pushed to the bottom via mt-auto */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-auto">
                      {/* View Details → opens the modal */}
                      <button
                        onClick={() => viewDetails(job)}
                        className="w-full sm:w-auto flex-1 bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm hover:bg-[#1E40AF]"
                      >
                        View Details
                      </button>

                      {/* Save / unsave toggle — disabled while the API call is in flight */}
                      <button
                        onClick={() => handleSave(job)}
                        disabled={savingId === jobId}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm ${
                          savedFlag ? "bg-green-200 text-green-700" : "bg-white/6 text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        {savedFlag ? "Saved ✓" : "Save"}
                      </button>

                      {/* Delete button — only visible to the original poster */}
                      {owner && (
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="w-full sm:w-auto bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Card footer: posted date + salary */}
                    <div className="mt-4 sm:mt-6 text-xs text-gray-400 flex justify-between items-center">
                      <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ""}</span>
                      <span className="font-mono text-gray-300">{job.salary || ""}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Job detail modal overlay ─────────────────────────────────────── */}
      {/*
       * Renders on top of the page when the user clicks "View Details".
       * Clicking the dark backdrop or the Close button dismisses it.
       * Pressing Escape also closes it (handled in the useEffect above).
       */}
      {isModalOpen && modalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Semi-transparent backdrop — clicking it closes the modal */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />

          {/* Modal content card */}
          <div className="relative max-w-3xl w-full mx-4 sm:mx-6 bg-[#050b1b] border border-white/6 rounded-2xl shadow-lg p-6">
            {/* Close button (top-right corner) */}
            <button
              className="absolute top-3 right-3 text-gray-300 bg-white/5 px-2 py-1 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>

            {/* Job header: title, company, location, posted-by */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white">{modalJob.title}</h3>
              <p className="text-sm text-[#60a5fa] mt-1">{modalJob.company}</p>
              <p className="text-xs text-gray-400 mt-1">{modalJob.location} · {modalJob.type}</p>
              {modalJob.postedBy?.name && (
                <p className="text-xs text-gray-500 mt-1">Posted by {modalJob.postedBy.name}</p>
              )}
            </div>

            {/* Skill tags */}
            {modalJob.tags && modalJob.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {modalJob.tags.map((t, i) => (
                  <span key={i} className="bg-white/6 text-gray-300 px-2 py-1 rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}

            {/* Full description */}
            <div className="text-sm text-gray-300 mb-4">{modalJob.description}</div>

            {/* Salary (optional) */}
            {modalJob.salary && (
              <p className="text-sm font-mono text-gray-300 mb-6">{modalJob.salary}</p>
            )}

            {/* Modal action buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Save / unsave from within the modal */}
              <button
                onClick={() => handleSave(modalJob)}
                className="bg-white/6 text-gray-200 px-4 py-2 rounded"
              >
                {savedIds.has(String(modalJob._id)) ? "Saved ✓" : "Save"}
              </button>

              {/* Delete — only for the original poster */}
              {isOwner(modalJob) && (
                <button
                  onClick={() => handleDelete(modalJob._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded"
                >
                  Delete
                </button>
              )}

              {/* Close button (bottom of modal) */}
              <button onClick={() => setIsModalOpen(false)} className="ml-auto bg-white/6 text-gray-200 px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
