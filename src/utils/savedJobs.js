// src/utils/savedJobs.js
const STORAGE_KEY = "savedJobs_v1";

export function loadSavedJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadSavedJobs error", e);
    return [];
  }
}

export function saveSavedJobs(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // broadcast for other tabs/components
    window.dispatchEvent(new Event("storage"));
    return true;
  } catch (e) {
    console.error("saveSavedJobs error", e);
    return false;
  }
}

export function isJobSaved(id) {
  const all = loadSavedJobs();
  return all.some((j) => String(j.id) === String(id));
}

export function addSavedJob(job) {
  const all = loadSavedJobs();
  if (!all.some((j) => String(j.id) === String(job.id))) {
    const toSave = [{ ...job, savedAt: new Date().toISOString() }, ...all];
    saveSavedJobs(toSave);
    return toSave;
  }
  return all;
}

export function removeSavedJob(id) {
	const all = loadSavedJobs().filter((j) => String(j.id) !== String(id));
	saveSavedJobs(all);
	return all;
}
