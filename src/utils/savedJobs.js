/**
 * @file src/utils/savedJobs.js
 * @description Legacy client-side saved-jobs utilities (localStorage-based).
 *
 * ⚠️  IMPORTANT: This file is kept for reference only.
 *      The production application now persists saved jobs in MongoDB via
 *      the Express backend (see src/api/saved.js).
 *      These localStorage functions are NO LONGER used anywhere in the app.
 *
 * When the app was purely frontend-only, saved jobs were stored in localStorage
 * as an array of serialised Job objects so they survived page refreshes.
 */

/** localStorage key for the saved-jobs array */
const STORAGE_KEY = "savedJobs_v1";

/**
 * Load the saved-jobs array from localStorage.
 *
 * @deprecated Use src/api/saved.js getSavedJobs() (MongoDB) instead.
 *
 * @returns {Array<Object>} Array of saved job objects (or empty array on failure)
 */
export function loadSavedJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadSavedJobs error", e);
    return [];
  }
}

/**
 * Persist the saved-jobs array to localStorage and broadcast a "storage" event
 * so other open tabs/components can react to the change.
 *
 * @deprecated Use src/api/saved.js saveJob() / unsaveJob() instead.
 *
 * @param {Array<Object>} list - The updated saved-jobs array
 * @returns {boolean} True if the write succeeded, false on error
 */
export function saveSavedJobs(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Dispatch a synthetic "storage" event so sibling components can react
    window.dispatchEvent(new Event("storage"));
    return true;
  } catch (e) {
    console.error("saveSavedJobs error", e);
    return false;
  }
}

/**
 * Check whether a job is currently saved.
 *
 * @deprecated Use src/api/saved.js getSavedJobs() and check the returned array.
 *
 * @param {string|number} id - The job's id
 * @returns {boolean}
 */
export function isJobSaved(id) {
  const all = loadSavedJobs();
  return all.some((j) => String(j.id) === String(id));
}

/**
 * Add a job to the saved list (no-op if already saved).
 *
 * @deprecated Use src/api/saved.js saveJob() instead.
 *
 * @param {Object} job - The job object to save
 * @returns {Array<Object>} The updated saved-jobs array
 */
export function addSavedJob(job) {
  const all = loadSavedJobs();
  if (!all.some((j) => String(j.id) === String(job.id))) {
    // Prepend with a savedAt timestamp for display purposes
    const toSave = [{ ...job, savedAt: new Date().toISOString() }, ...all];
    saveSavedJobs(toSave);
    return toSave;
  }
  return all; // Already saved — return unchanged array
}

/**
 * Remove a job from the saved list by id.
 *
 * @deprecated Use src/api/saved.js unsaveJob() instead.
 *
 * @param {string|number} id - The job's id to remove
 * @returns {Array<Object>} The updated saved-jobs array
 */
export function removeSavedJob(id) {
  const all = loadSavedJobs().filter((j) => String(j.id) !== String(id));
  saveSavedJobs(all);
  return all;
}
