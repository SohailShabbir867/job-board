/**
 * @file src/components/Navbar.jsx
 * @description Responsive site navigation bar.
 *
 * Features:
 *  - Sticky positioning so it remains at the top of the viewport on scroll
 *  - Desktop layout: Logo | Nav links | Auth section (all inline)
 *  - Mobile layout: Logo | Hamburger button → collapsible slide-down menu
 *  - Active link highlighting via React Router's <NavLink> and the isActive prop
 *  - If the user is authenticated, a profile dropdown shows their email and a Logout button
 *  - If not authenticated, Sign in and Register links are shown
 *  - Keyboard accessible: Escape key closes the mobile menu, resize listener
 *    closes it automatically when the viewport grows past the mobile breakpoint
 *  - Hamburger icon toggles between ☰ (open) and ✕ (close) SVGs
 */

import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import auth context for user state

/**
 * Navbar component — rendered at the top of every page via App.jsx.
 */
export default function Navbar() {
  /** Controls whether the mobile slide-down menu is visible */
  const [open, setOpen] = useState(false);

  /** Current authenticated user object (or null if not logged in) */
  const { user, logout } = useAuth(); // auth state from AuthContext

  /** id attribute for the mobile menu <div> (used for aria-controls) */
  const menuId = "primary-navigation";

  // ── Side effects ──────────────────────────────────────────────────────────

  /**
   * Attach keyboard and resize listeners on mount:
   *  - Escape key: closes the mobile menu (keyboard accessibility)
   *  - Window resize: closes the mobile menu when the viewport becomes wide enough
   *    for the desktop layout so no stale open state persists after resizing
   *
   * Cleanup removes both listeners on component unmount.
   */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function onResize() {
      // md breakpoint is 768 px — match Tailwind's default md: prefix
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []); // Empty deps → runs once on mount, cleaned up on unmount

  // ── Shared style helpers ──────────────────────────────────────────────────

  /** Base Tailwind classes applied to every nav link */
  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";

  /**
   * Function that returns the NavLink className based on its active state.
   * React Router's <NavLink> calls this with { isActive: boolean }.
   *
   * @param {{ isActive: boolean }} param
   * @returns {string} Tailwind class string
   */
  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive ? "text-[#60A5FA]" : "text-slate-200 hover:text-white"
    }`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-40 bg-[#050b1b] text-slate-100 shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3">
            {/* Circular gradient logo icon */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#2563EB] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Outer glow shape */}
                <path
                  d="M12 3C8 3 3 7 3 11s5 8 9 9c4-1 9-5 9-9s-5-8-9-8z"
                  fill="white"
                  opacity="0.15"
                />
                {/* Inner circle */}
                <path
                  d="M12 6.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">JobBoard</span>
          </Link>

          {/* ── Desktop navigation links (hidden on mobile) ───────────── */}
          <nav className="hidden md:flex items-center gap-4" aria-label="Primary">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/jobs" className={navLinkClass}>Jobs</NavLink>
            <NavLink to="/saved" className={navLinkClass}>Saved Jobs</NavLink>
            <NavLink to="/post-job" className={navLinkClass}>Post Job</NavLink>
          </nav>

          {/* ── Desktop auth section (hidden on mobile) ───────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              // ── Logged-in: profile dropdown ─────────────────────────────
              // The dropdown appears on hover using Tailwind's `group` + `group-hover:block`
              <div className="relative group">
                <button className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10">
                  {user.name || "Profile"}
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-[#071026] rounded-md shadow-lg hidden group-hover:block">
                  {/* User email displayed at the top of the dropdown */}
                  <div className="px-4 py-2 text-sm text-slate-200 border-b border-white/10">
                    {user.email}
                  </div>
                  {/* Logout button — clears the JWT and user state via AuthContext */}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              // ── Not logged in: sign in / register links ─────────────────
              <>
                <Link to="/signin" className="px-3 py-2 rounded-md hover:bg-white/5">
                  Sign in
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md hover:bg-white/5">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger button (visible only on mobile) ─────────── */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen((v) => !v)} // Toggle open/closed state
              aria-controls={menuId}              // Links to the mobile menu's id
              aria-expanded={open}                // Tells screen readers if menu is open
              className="p-2 rounded-md bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <span className="sr-only">Toggle navigation</span>
              {/* Conditionally render Close (✕) or Hamburger (☰) icon */}
              {open ? (
                // Close / X icon
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Hamburger icon (three horizontal lines)
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M3 7h18M3 12h18M3 17h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown menu ────────────────────────────────────────── */}
        {/*
         * Uses max-height CSS transition to animate open/close smoothly.
         * max-h-80 is enough for all links + auth section with comfortable spacing.
         */}
        <div
          id={menuId}
          className={`md:hidden bg-[#071026] overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-80" : "max-h-0"
          }`}
        >
          <div className="px-4 pb-4 pt-2 space-y-1">
            {/* Mobile nav links — each closes the menu on click */}
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/jobs" className={navLinkClass} onClick={() => setOpen(false)}>Jobs</NavLink>
            <NavLink to="/saved" className={navLinkClass} onClick={() => setOpen(false)}>Saved Jobs</NavLink>
            <NavLink to="/post-job" className={navLinkClass} onClick={() => setOpen(false)}>Post Job</NavLink>

            {/* Mobile auth section — separated by a top border */}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2 mt-2">
              {user ? (
                // Logged-in mobile: show email + logout button
                <>
                  <div className="px-3 py-2 text-sm text-slate-200">
                    {user.email}
                  </div>
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="px-3 py-2 text-sm text-red-400 hover:bg-white/5 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Not logged in mobile: show sign-in + register links
                <>
                  <Link to="/signin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm hover:bg-white/5">
                    Sign in
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm hover:bg-white/5">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
