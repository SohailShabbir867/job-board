// src/pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSavedJobs, addSavedJob, removeSavedJob, isJobSaved } from "../utils/savedJobs";

const LOCAL_KEY_POSTS = "postedJobs";

const randType = () => ["Full-time", "Part-time", "Contract", "Remote", "Freelance"][Math.floor(Math.random() * 5)];
const randSalary = () => {
  const min = (Math.floor(Math.random() * 60) + 40) * 1000;
  const max = min + (Math.floor(Math.random() * 50) + 20) * 1000;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};
const randPosted = () => {
  const d = Math.floor(Math.random() * 30) + 1;
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

async function fetchJsonPlaceholder() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=12");
  const posts = await res.json();
  return posts.map((p) => ({
    id: `api-post-${p.id}`,
    title: (p.title || "Developer").slice(0, 80),
    company: "Sample Company",
    location: "Remote",
    type: randType(),
    salary: randSalary(),
    description: p.body,
    tags: ["React", "JavaScript"],
    posted: randPosted(),
  }));
}

async function fetchGithub() {
  const res = await fetch(
    `https://api.github.com/search/repositories?q=react+javascript+frontend&sort=stars&order=desc&per_page=12`
  );
  const json = await res.json();
  const items = json.items || [];
  return items.map((r) => ({
    id: `api-gh-${r.id}`,
    title: `${(r.language || "Full Stack")} Developer`,
    company: r.owner?.login || "GitHub",
    location: "Remote",
    type: randType(),
    salary: randSalary(),
    description: r.description || "Work on open-source tech.",
    tags: (r.topics && r.topics.length) ? r.topics.slice(0, 3) : ["React", "JS"],
    posted: randPosted(),
    url: r.html_url,
  }));
}

async function fetchCountries() {
  const res = await fetch("https://restcountries.com/v3.1/region/europe?fields=name,capital");
  const json = await res.json();
  return json.slice(0, 12).map((c, i) => ({
    id: `api-country-${i}`,
    title: "Remote Developer",
    company: `${c.name?.common || "Global"} Tech`,
    location: c.capital?.[0] ? `${c.capital[0]}, Remote` : "Remote",
    type: "Remote",
    salary: randSalary(),
    description: `Join our remote team in ${c.name?.common || "Europe"}.`,
    tags: ["Remote", "International"],
    posted: randPosted(),
  }));
}

export default function Jobs() {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [apiJobs, setApiJobs] = useState([]);
  const [saved, setSaved] = useState(loadSavedJobs());
  const [source, setSource] = useState("jsonplaceholder");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalJob, setModalJob] = useState(null);

  // load posted jobs (user posts)
  function loadPosted() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY_POSTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    function onKey(e) { if (e.key === 'Escape') setIsModalOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);
  
  // remove another tab change listener
  useEffect(() => {
    const onStorage = () => {
      setSaved(loadSavedJobs());
      setPostedJobs(loadPosted());
    };
    window.addEventListener("storage", onStorage);
    setPostedJobs(loadPosted());
    setSaved(loadSavedJobs());
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function loadApi(which = "jsonplaceholder") {
    setLoading(true);
    setError(null);
    try {
      let list = [];
      if (which === "jsonplaceholder") list = await fetchJsonPlaceholder();
      else if (which === "github") list = await fetchGithub();
      else if (which === "countries") list = await fetchCountries();
      else list = await fetchJsonPlaceholder();
      setApiJobs(list);
      // also cache to session for details lookup if needed
      try { sessionStorage.setItem("lastApiJobs", JSON.stringify(list)); } catch (e) { console.warn('sessionStorage.setItem failed', e); }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch API jobs.");
      setApiJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApi(source);
  }, [source]);

  const merged = [
    ...postedJobs,
    ...apiJobs.filter((a) => !postedJobs.some((p) => String(p.id) === String(a.id))),
  ];

  // save / unsave handlers using utils
  function handleSave(job) {
    if (isJobSaved(job.id)) {
      removeSavedJob(job.id);
      setSaved(loadSavedJobs());
    } else {
      addSavedJob(job);
      setSaved(loadSavedJobs());
    }
  }

  // show job details in a modal (also cache merged list for other pages)
  function viewDetails(jobId) {
    try { sessionStorage.setItem('lastJobs', JSON.stringify(merged)); } catch (e) { console.warn('sessionStorage.setItem failed', e); }
    const job = merged.find((j) => String(j.id) === String(jobId));
    if (job) {
      setModalJob(job);
      setIsModalOpen(true);
    } else {
      // fallback: navigate to details route
      navigate(`/jobs/${encodeURIComponent(jobId)}`);
    }
  }

  function handleDeleteLocal(id) {
    if (!confirm("Delete your post?")) return;
    const updated = loadPosted().filter((j) => String(j.id) !== String(id));
    localStorage.setItem(LOCAL_KEY_POSTS, JSON.stringify(updated));
    setPostedJobs(updated);
    // also update merged automatically via state
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="min-h-screen w-screen bg-[#050b1b] text-white m-0 p-0 overflow-x-hidden flex flex-col items-stretch">
      {/* Full-bleed header, inner content centered */}
      <header id="jobs-subheader" className="bg-[#050b1b] text-white w-full m-0 p-0 sticky top-0 z-40 shadow">
        <div className="w-full px-0 py-4 flex flex-col md:flex-row items-center justify-between gap-3" style={{ width: '99%', margin: '0 auto' }}>
          {/* inner logo removed to match global navbar alignment */}

           <div className="w-full md:w-auto">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full">
               <select
                 value={source}
                 onChange={(e) => setSource(e.target.value)}
                 className="px-3 py-2 rounded bg-white text-sm text-gray-800 w-full sm:w-auto"
               >
                 <option value="jsonplaceholder">Sample Jobs</option>
                 <option value="github">Tech Jobs (GitHub)</option>
                 <option value="countries">Remote (Global)</option>
               </select>

               <div className="flex gap-2 w-full sm:w-auto">
                 <button
                   onClick={() => loadApi(source)}
                   className="flex-1 sm:flex-none bg-white text-[#2563EB] px-3 py-2 rounded-md text-sm border"
                 >
                   Refresh
                 </button>
               </div>
             </div>
           </div>
         </div>
       </header>

      {/* Main centered content with responsive paddings and max width */}
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
          <div className="flex items-center justify-center mb-6 px-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Job Listings</h2>
              <div className="text-sm text-gray-300 mt-1">{merged.length} results</div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
            </div>
          ) : error ? (
            <div className="bg-red-50/10 border border-red-600/20 p-4 rounded text-red-300">{error}</div>
          ) : (
            <div className="grid gap-4 px-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
              {merged.map((job) => {
                const savedFlag = saved.some((s) => String(s.id) === String(job.id));
                return (
                  <article key={job.id} className="bg-[#071026] border border-white/6 p-4 sm:p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col h-full min-h-[260px] overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 pr-2 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight truncate">{job.title}</h3>
                        <p className="text-sm text-[#60a5fa] font-medium mt-1 truncate">{job.company}</p>
                        <p className="text-xs text-gray-400 mt-1">{job.location} · {job.type}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0 mt-3 sm:mt-0">
                        {String(job.id).startsWith("local-") && (
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
                        onClick={() => viewDetails(job.id)}
                        className="w-full sm:w-auto flex-1 bg-[#2563EB] text-white px-3 py-2 rounded-md text-sm hover:bg-[#1E40AF]"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => handleSave(job)}
                        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm ${
                          savedFlag ? "bg-green-200 text-green-700" : "bg-white/6 text-gray-200 hover:bg-white/10"
                        }`}
                       >
                         {savedFlag ? "Saved ✓" : "Save"}
                       </button>

                      {String(job.id).startsWith("local-") && (
                        <button
                          onClick={() => handleDeleteLocal(job.id)}
                          className="w-full sm:w-auto bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-6 text-xs text-gray-400 flex justify-between items-center">
                      <span>{job.posted || ""}</span>
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
            </div>

            {modalJob.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {modalJob.tags.map((t, i) => (
                  <span key={i} className="bg-white/6 text-gray-300 px-2 py-1 rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-300 mb-6">{modalJob.description}</div>

            <div className="flex gap-2 flex-wrap">
              {modalJob.url && (
                <a href={modalJob.url} target="_blank" rel="noreferrer" className="inline-block bg-[#2563EB] text-white px-4 py-2 rounded">Open on source</a>
              )}

              <button
                onClick={() => { handleSave(modalJob); }}
                className="bg-white/6 text-gray-200 px-4 py-2 rounded"
              >
                {isJobSaved(modalJob.id) ? 'Saved ✓' : 'Save'}
              </button>

              {String(modalJob.id).startsWith('local-') && (
                <button
                  onClick={() => { handleDeleteLocal(modalJob.id); setIsModalOpen(false); }}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded"
                >
                  Delete
                </button>
              )}

              <button onClick={() => setIsModalOpen(false)} className="ml-auto bg-white/6 text-gray-200 px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
