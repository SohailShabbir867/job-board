// src/pages/Saved.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedJobs, unsaveJob } from "../api/saved";
import { useAuth } from "../context/AuthContext";

export default function Saved() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getSavedJobs()
      .then(setSaved)
      .catch((err) => setError(err.message || "Failed to load saved jobs"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleUnsave(jobId) {
    if (!window.confirm("Remove from saved jobs?")) return;
    try {
      await unsaveJob(jobId);
      setSaved((prev) => prev.filter((j) => String(j._id) !== String(jobId)));
    } catch (err) {
      alert(err.message || "Failed to remove job");
    }
  }

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

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] text-white p-6">
        <div className="bg-red-900/20 text-red-300 p-4 rounded">{error}</div>
      </div>
    );
  }

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

  return (
    <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0">
      <div className="w-full px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-4 text-white">Saved Jobs</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((job) => (
            <div key={job._id} className="bg-[#071026] p-4 rounded-lg shadow border border-white/6">
              <h3 className="font-semibold text-white">{job.title}</h3>
              <p className="text-sm text-[#60a5fa]">{job.company}</p>
              <p className="text-xs text-gray-400">{job.location} · {job.type}</p>
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">{job.description}</p>
              {job.salary && (
                <p className="text-xs font-mono text-gray-300 mt-1">{job.salary}</p>
              )}
              <div className="mt-3 flex gap-2">
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
