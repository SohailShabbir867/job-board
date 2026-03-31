/**
 * @file src/context/JobsContext.jsx
 * @description React context for job listing state management.
 *
 * JobsContext / JobsProvider:
 *  - Holds the full list of job documents fetched from the MongoDB API.
 *  - Provides loading and error state so components can react to data lifecycle.
 *  - Exposes fetchJobs(), addJob(), and removeJob() to manipulate the list
 *    without any component needing to call the API directly.
 *  - Jobs are automatically fetched once when the provider mounts (on app load).
 *
 * Usage:
 *   // Wrap your app (done in App.jsx):
 *   <JobsProvider>...</JobsProvider>
 *
 *   // Consume in any descendant component:
 *   const { jobs, loading, error, fetchJobs, addJob, removeJob } = useJobs();
 */

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

// ─────────────────────────────────────────────
// Context Object (with default values for type safety)
// ─────────────────────────────────────────────

/**
 * The raw React context with sensible default values.
 * The actual values are provided by <JobsProvider>.
 *
 * Defining defaults here prevents "undefined" errors if a component
 * accidentally renders outside of the provider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const JobsContext = createContext({
  jobs: [],           // array of job documents
  loading: false,     // true while fetching from the API
  error: null,        // error message string, or null when healthy
  fetchJobs: () => {},
  addJob: async () => {},
  removeJob: async () => {},
});

// ─────────────────────────────────────────────
// JobsProvider Component
// ─────────────────────────────────────────────

/**
 * Context provider that supplies job listing state to all descendants.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function JobsProvider({ children }) {
  /** Flat array of job documents returned by the API */
  const [jobs, setJobs] = useState([]);

  /** True while the API request is in flight */
  const [loading, setLoading] = useState(false);

  /** Holds an error message string when the last fetch failed, otherwise null */
  const [error, setError] = useState(null);

  // ── fetchJobs ──────────────────────────────────────────────────────────────

  /**
   * Fetch all jobs from the API and replace the current list.
   * Wrapped in useCallback so it can safely be used as a useEffect dependency
   * without causing infinite re-render loops.
   */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous error before starting a new fetch
    try {
      const data = await getJobs(); // GET /api/jobs
      setJobs(data);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false); // Reset loading state regardless of success or failure
    }
  }, []); // No dependencies — this function never needs to be recreated

  /**
   * Automatically fetch jobs once when the provider first mounts (app load).
   * Components can also call fetchJobs() manually to trigger a refresh.
   */
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── addJob ─────────────────────────────────────────────────────────────────

  /**
   * Create a new job via the API and optimistically prepend it to the local list.
   * The new job appears at the top of the list immediately without a full re-fetch.
   *
   * @param {Object} jobData - The job form data to submit
   * @returns {Promise<Object>} The created Job document returned by the API
   * @throws {Error} Propagates API errors (e.g. validation failure, unauthenticated)
   */
  const addJob = async (jobData) => {
    const newJob = await apiCreateJob(jobData); // POST /api/jobs
    setJobs((prev) => [newJob, ...prev]); // Prepend so it appears at the top
    return newJob;
  };

  // ── removeJob ──────────────────────────────────────────────────────────────

  /**
   * Delete a job via the API and remove it from the local list.
   * Only the user who originally posted the job can call this (enforced server-side).
   *
   * @param {string} jobId - The MongoDB _id of the job to delete
   * @throws {Error} Propagates API errors (403 not owner, 404 not found)
   */
  const removeJob = async (jobId) => {
    await apiDeleteJob(jobId); // DELETE /api/jobs/:id
    // Remove the deleted job from state without a full re-fetch
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

// ─────────────────────────────────────────────
// useJobs Hook
// ─────────────────────────────────────────────

/**
 * Custom hook for consuming JobsContext.
 * Must be used inside a component that is a descendant of <JobsProvider>.
 *
 * @returns {{ jobs: Array, loading: boolean, error: string|null, fetchJobs: Function, addJob: Function, removeJob: Function }}
 *
 * @example
 * function JobsList() {
 *   const { jobs, loading } = useJobs();
 *   if (loading) return <Spinner />;
 *   return jobs.map(job => <JobCard key={job._id} job={job} />);
 * }
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useJobs() {
  return useContext(JobsContext);
}
