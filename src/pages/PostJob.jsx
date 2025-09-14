// src/pages/PostJob.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOCAL_KEY = "postedJobs";

function loadPosted() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function PostJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      alert("Please provide a job title and company.");
      return;
    }

    const id = `local-${Date.now()}`;
    const newJob = {
      id,
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || "Remote",
      type,
      salary: salary || "",
      description: description || "",
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      posted: "just now",
    };

    const arr = loadPosted();
    arr.unshift(newJob); // put newest at top
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
    // fire storage event for single-tab update
    window.dispatchEvent(new Event("storage"));

    // navigate to jobs page to see the post
    navigate("/jobs");
  }

  return (
    <div className="w-screen min-h-screen bg-[#050b1b] text-white m-0 p-0 overflow-x-hidden">
      <div className="w-full px-4 sm:px-6">
        <div className="bg-[#071026] rounded-lg shadow p-6 sm:p-8 w-full border border-white/6">
          <h1 className="text-2xl font-bold mb-4 text-white">Post a Job</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Job Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="e.g. Senior React Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Remote or City, Country"
                />
              </div>

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

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Tags (comma separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#071026] border border-white/10 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="e.g. React, TypeScript, Remote"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-4 py-2 rounded w-full sm:w-auto">Post Job</button>
              <button type="button" onClick={() => navigate("/jobs")} className="w-full sm:w-auto px-4 py-2 border border-white/10 rounded text-white bg-white/5 hover:bg-white/10">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
