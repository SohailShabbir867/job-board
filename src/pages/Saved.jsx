// src/pages/Saved.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSavedJobs, removeSavedJob } from "../utils/savedJobs";

export default function Saved() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const onStorage = () => setSaved(loadSavedJobs());
    window.addEventListener("storage", onStorage);
    setSaved(loadSavedJobs());
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleUnsave(id) {
    if (!confirm("Remove from saved jobs?")) return;
    removeSavedJob(id);
    setSaved(loadSavedJobs());
  }

  if (!saved.length) {
    return (
      <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0">
        <div className="w-full px-4 sm:px-6">
          <div className="bg-[#071026] p-6 rounded-lg shadow text-center w-full border border-white/6">
            <h2 className="text-xl font-bold mb-2 text-white">No saved jobs</h2>
            <p className="text-gray-300 mb-4">Save jobs from the listings to view them here later.</p>
            <button onClick={() => navigate("/jobs")} className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded">Browse jobs</button>
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
            <div key={job.id} className="bg-[#071026] p-4 rounded-lg shadow border border-white/6">
              <h3 className="font-semibold text-white">{job.title}</h3>
              <p className="text-sm text-[#60a5fa]">{job.company}</p>
              <p className="text-xs text-gray-400">{job.location} · {job.type}</p>
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">{job.description}</p>

              <div className="mt-3 flex gap-2">
                <button onClick={() => navigate(`/jobs/${encodeURIComponent(job.id)}`)} className="flex-1 bg-[#2563EB] hover:bg-[#1E40AF] text-white px-3 py-2 rounded">View</button>
                <button onClick={() => handleUnsave(job.id)} className="bg-red-100 text-red-700 px-3 py-2 rounded">Remove</button>
              </div>
              <div className="mt-2 text-xs text-gray-400">Saved: {new Date(job.savedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
