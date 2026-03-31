// src/utils/auth.js
const USERS_KEY = "jobboard_users_v1";
const CURRENT_KEY = "jobboard_current_user_v1";

function _readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function _writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

export function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  const users = _readUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Email already registered");
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password, // NOTE: plain text for demo only
    createdAt: new Date().toISOString(),
  };
  users.unshift(newUser);
  _writeUsers(users);
  return { ...newUser, password: undefined };
}

export function loginUser(email, password) {
  const users = _readUsers();
  const user = users.find(
    u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
  );
  if (!user) throw new Error("Invalid email or password");
  // store session
  const safe = { id: user.id, name: user.name, email: user.email };
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(safe));
  } catch {
    // ignore storage errors
  }
  return safe;
}

export function logout() {
  try {
    localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore storage errors
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // ignore storage errors
    return null;
  }
}
