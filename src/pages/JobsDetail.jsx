// src/pages/JobsDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob } from "../api/jobs";
import { saveJob, unsaveJob, getSavedJobs } from "../api/saved";
import { useAuth } from "../context/AuthContext";
import { useJobs } from "../context/JobsContext";

export default function JobsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeJob } = useJobs();
  const [job, setJob] = useState(null);
  const [savedFlag, setSavedFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJob(id)
      .then((data) => {
        setJob(data);
        if (user) {
          getSavedJobs()
            .then((list) => setSavedFlag(list.some((j) => String(j._id) === String(data._id))))
            .catch(() => {});
        }
      })
      .catch(() => setError("Job not found"))
      .finally(() => setLoading(false));
  }, [id, user]);

  async function toggleSave() {
    if (!user) { navigate("/signin"); return; }
    if (savedFlag) {
      await unsaveJob(job._id);
      setSavedFlag(false);
    } else {
      await saveJob(job._id);
      setSavedFlag(true);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete your post?")) return;
    try {
      await removeJob(job._id);
      navigate("/jobs");
    } catch (err) {
      alert(err.message || "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

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

  const isOwner = user && job.postedBy &&
    (String(job.postedBy._id || job.postedBy) === String(user.id));

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
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((t, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{t}</span>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
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

            <div className="space-y-2">
              <button
                onClick={toggleSave}
                className={`w-full py-2 rounded ${savedFlag ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                {savedFlag ? "Saved ✓" : "Save for later"}
              </button>

              {isOwner && (
                <button onClick={handleDelete} className="w-full bg-red-100 text-red-700 py-2 rounded">
                  Delete post
                </button>
              )}

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
