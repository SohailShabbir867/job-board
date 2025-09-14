// src/pages/JobDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadSavedJobs, addSavedJob, removeSavedJob, isJobSaved } from "../utils/savedJobs";

const LOCAL_POSTS_KEY = "postedJobs";
const SESSION_API_KEY = "lastApiJobs";

function loadPosted() {
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [savedFlag, setSavedFlag] = useState(false);

  useEffect(() => {
    const posted = loadPosted();
    const local = posted.find((j) => String(j.id) === String(id));
    if (local) {
      setJob(local);
      setSavedFlag(isJobSaved(local.id));
      return;
    }

    // look up cached API jobs
    try {
      const raw = sessionStorage.getItem(SESSION_API_KEY);
      if (raw) {
        const apiList = JSON.parse(raw);
        const found = apiList.find((j) => String(j.id) === String(id));
        if (found) {
          setJob(found);
          setSavedFlag(isJobSaved(found.id));
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // not found
    setJob(null);
  }, [id]);

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-3">Job not found</h2>
          <p className="mb-4 text-gray-600">The job might have been removed or was from a previous API fetch.</p>
          <button onClick={() => navigate("/jobs")} className="bg-[#2563EB] text-white px-4 py-2 rounded">Back to Jobs</button>
        </div>
      </div>
    );
  }

  function toggleSave() {
    if (isJobSaved(job.id)) {
      removeSavedJob(job.id);
      setSavedFlag(false);
    } else {
      addSavedJob(job);
      setSavedFlag(true);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white p-6">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-sm text-blue-100 mt-1">{job.company}</p>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-700">Job Description</h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          <aside className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-700">Company</h4>
              <p className="text-sm text-gray-800">{job.company}</p>
              <p className="text-xs text-gray-500 mt-2">Salary</p>
              <p className="text-sm text-gray-800">{job.salary || "—"}</p>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-[#2563EB] text-white py-2 rounded">Apply Now</button>
              <button onClick={toggleSave} className={`w-full py-2 rounded ${savedFlag ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {savedFlag ? "Saved ✓" : "Save for later"}
              </button>

              {String(job.id).startsWith("local-") && (
                <button onClick={() => {
                  if (!confirm("Delete your post?")) return;
                  const arr = loadPosted().filter(j => j.id !== job.id);
                  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(arr));
                  window.dispatchEvent(new Event("storage"));
                  navigate("/jobs");
                }} className="w-full bg-red-100 text-red-700 py-2 rounded">Delete post</button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
