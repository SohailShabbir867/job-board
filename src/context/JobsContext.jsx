// src/context/JobsContext.jsx
import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import {
  getJobs,
  createJob as apiCreateJob,
  deleteJob as apiDeleteJob,
} from "../api/jobs";

// eslint-disable-next-line react-refresh/only-export-components
export const JobsContext = createContext({
  jobs: [],
  loading: false,
  error: null,
  fetchJobs: () => {},
  addJob: async () => {},
  removeJob: async () => {},
});

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = async (jobData) => {
    const newJob = await apiCreateJob(jobData);
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const removeJob = async (jobId) => {
    await apiDeleteJob(jobId);
    setJobs((prev) => prev.filter((j) => j._id !== jobId));
  };

  return (
    <JobsContext.Provider
      value={{ jobs, loading, error, fetchJobs, addJob, removeJob }}
    >
      {children}
    </JobsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useJobs() {
  return useContext(JobsContext);
}
