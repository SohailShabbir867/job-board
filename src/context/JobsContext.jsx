// src/context/JobsContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const JobsContext = createContext({
  postedJobs: [],
  addPostedJob: () => {},
  removePostedJob: () => {}
});

const LOCAL_KEY = "jobfinder_posted_jobs_v1";

export function JobsProvider({ children }) {
  const [postedJobs, setPostedJobs] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(postedJobs));
    } catch (e) {
      console.error("Failed to persist posted jobs", e);
    }
  }, [postedJobs]);

  const addPostedJob = (job) => {
    // put newest first
    setPostedJobs((prev) => [job, ...prev]);
  };

  const removePostedJob = (jobId) => {
    setPostedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  return (
    <JobsContext.Provider value={{ postedJobs, addPostedJob, removePostedJob }}>
      {children}
    </JobsContext.Provider>
  );
}
