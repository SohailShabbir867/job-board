// src/pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../context/JobsContext";
import { useAuth } from "../context/AuthContext";
import { saveJob, unsaveJob, getSavedJobs } from "../api/saved";

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, loading, error, fetchJobs, removeJob } = useJobs();
  const { user } = useAuth();

  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalJob, setModalJob] = useState(null);

  // Load saved job IDs when the user changes
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    getSavedJobs()
      .then((list) => setSavedIds(new Set(list.map((j) => String(j._id)))))
      .catch(() => setSavedIds(new Set()));
  }, [user]);

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    function onKey(e) { if (e.key === "Escape") setIsModalOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  async function handleSave(job) {
    if (!user) { navigate("/signin"); return; }
    const jobId = String(job._id);
    setSavingId(jobId);
    setSaveError("");
    try {
      if (savedIds.has(jobId)) {
        await unsaveJob(jobId);
        setSavedIds((prev) => { const s = new Set(prev); s.delete(jobId); return s; });
      } else {
        await saveJob(jobId);
        setSavedIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err) {
      setSaveError(err.message || "Failed to update saved jobs");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(jobId) {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await removeJob(jobId);
      if (modalJob && String(modalJob._id) === String(jobId)) setIsModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  }

  function viewDetails(job) {
    setModalJob(job);
    setIsModalOpen(true);
  }

  const isOwner = (job) => user && job.postedBy && (
    String(job.postedBy._id || job.postedBy) === String(user.id)
  );

  return (
    <div className="min-h-screen w-screen bg-[#050b1b] text-white m-0 p-0 overflow-x-hidden flex flex-col items-stretch">
      {/* Sub-header */}
      <header className="bg-[#050b1b] text-white w-full m-0 p-0 sticky top-0 z-40 shadow">
        <div className="w-full px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3" style={{ width: '99%', margin: '0 auto' }}>
          <div className="w-full md:w-auto flex justify-end">
            <button
              onClick={() => fetchJobs()}
              className="bg-white text-[#2563EB] px-3 py-2 rounded-md text-sm border"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full m-0 p-0">
        <div
          className="w-full px-0 py-6"
          style={{
            width: '99%',
            margin: '0 auto',
            backgroundImage: `radial-gradient(circle at 10% 10%, rgba(37,99,235,0.06), transparent 12%),
                              radial-gradient(circle at 90% 80%, rgba(59,130,246,0.04), transparent 18%),
                              linear-gradient(180deg, rgba(5,11,27,0.98), rgba(5,11,27,0.95))`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: 'cover',
          }}
        >
          {saveError && (
            <div className="mx-4 mb-4 bg-red-900/30 text-red-300 border border-red-700/20 p-3 rounded text-sm">
              {saveError}
            </div>
          )}
          <div className="flex items-center justify-center mb-6 px-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Job Listings</h2>
              <div className="text-sm text-gray-300 mt-1">{jobs.length} results</div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
            </div>
          ) : error ? (
            <div className="bg-red-50/10 border border-red-600/20 p-4 rounded text-red-300 mx-4">{error}</div>
          ) : jobs.length === 0 ? (
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
            <div className="grid gap-4 px-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
              {jobs.map((job) => {
                const jobId = String(job._id);
                const savedFlag = savedIds.has(jobId);
                const owner = isOwner(job);
                return (
                  <article key={jobId} className="bg-[#071026] border border-white/6 p-4 sm:p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col h-full min-h-[260px] overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 pr-2 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight truncate">{job.title}</h3>
                        <p className="text-sm text-[#60a5fa] font-medium mt-1 truncate">{job.company}</p>
                        <p className="text-xs text-gray-400 mt-1">{job.location} · {job.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0 mt-3 sm:mt-0">
                        {owner && (
                          <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full whitespace-nowrap">Your post</span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                          job.type === "Full-time" ? "bg-green-100 text-green-700" :
                          job.type === "Part-time" ? "bg-orange-100 text-orange-700" :
                          job.type === "Contract" ? "bg-purple-100 text-purple-700" :
                          job.type === "Remote" ? "bg-indigo-800 text-indigo-200" :
                          "bg-indigo-100 text-indigo-700"
                        }`}>{job.type}</span>
                      </div>
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.tags.map((t, i) => (
                          <span key={i} className="bg-white/6 text-gray-300 px-2 py-1 rounded-full text-xs">{t}</span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-300 mt-3 line-clamp-3">{job.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-auto">
                      <button
                        onClick={() => viewDetails(job)}
                        className="w-full sm:w-auto flex-1 bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm hover:bg-[#1E40AF]"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleSave(job)}
                        disabled={savingId === jobId}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm ${
                          savedFlag ? "bg-green-200 text-green-700" : "bg-white/6 text-gray-200 hover:bg-white/10"
                        }`}
                      >
                        {savedFlag ? "Saved ✓" : "Save"}
                      </button>
                      {owner && (
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="w-full sm:w-auto bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

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

      {/* Job details modal */}
      {isModalOpen && modalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative max-w-3xl w-full mx-4 sm:mx-6 bg-[#050b1b] border border-white/6 rounded-2xl shadow-lg p-6">
            <button
              className="absolute top-3 right-3 text-gray-300 bg-white/5 px-2 py-1 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white">{modalJob.title}</h3>
              <p className="text-sm text-[#60a5fa] mt-1">{modalJob.company}</p>
              <p className="text-xs text-gray-400 mt-1">{modalJob.location} · {modalJob.type}</p>
              {modalJob.postedBy?.name && (
                <p className="text-xs text-gray-500 mt-1">Posted by {modalJob.postedBy.name}</p>
              )}
            </div>

            {modalJob.tags && modalJob.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {modalJob.tags.map((t, i) => (
                  <span key={i} className="bg-white/6 text-gray-300 px-2 py-1 rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-300 mb-4">{modalJob.description}</div>
            {modalJob.salary && (
              <p className="text-sm font-mono text-gray-300 mb-6">{modalJob.salary}</p>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSave(modalJob)}
                className="bg-white/6 text-gray-200 px-4 py-2 rounded"
              >
                {savedIds.has(String(modalJob._id)) ? "Saved ✓" : "Save"}
              </button>
              {isOwner(modalJob) && (
                <button
                  onClick={() => handleDelete(modalJob._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded"
                >
                  Delete
                </button>
              )}
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
