import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // import AuthContex


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth(); // auth state
  const menuId = "primary-navigation";

  // Close on ESC / resize
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive ? "text-[#60A5FA]" : "text-slate-200 hover:text-white"
    }`;

  return (
    <>
    <header className="sticky top-0 z-40 bg-[#050b1b] text-slate-100 shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#2563EB] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C8 3 3 7 3 11s5 8 9 9c4-1 9-5 9-9s-5-8-9-8z"
                fill="white"
                opacity="0.15"
              />
              <path
                d="M12 6.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">JobBoard</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-4" aria-label="Primary">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass}>
            Jobs
          </NavLink>
          <NavLink to="/saved" className={navLinkClass}>
            Saved Jobs
          </NavLink>
          <NavLink to="/post-job" className={navLinkClass}>
            Post Job
          </NavLink>
        </nav>

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            // If signed in → Profile dropdown
            <div className="relative group">
              <button className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10">
                {user.name || "Profile"}
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-[#071026] rounded-md shadow-lg hidden group-hover:block">
                <div className="px-4 py-2 text-sm text-slate-200 border-b border-white/10">
                  {user.email}
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            // If not signed in → Show Sign in & Register
            <>
              <Link
                to="/signin"
                className="px-3 py-2 rounded-md hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md hover:bg-white/5"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-controls={menuId}
            aria-expanded={open}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <span className="sr-only">Toggle navigation</span>
            {open ? (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
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

      {/* Mobile menu */}
      <div
        id={menuId}
        className={`md:hidden bg-[#071026] overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1">
          <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink
            to="/jobs"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            Jobs
          </NavLink>
          <NavLink
            to="/saved"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            Saved Jobs
          </NavLink>
          <NavLink
            to="/post-job"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            Post Job
          </NavLink>

          {/* Auth section (mobile) */}
          <div className="pt-3 border-t border-white/5 flex flex-col gap-2 mt-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-slate-200">
                  {user.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-sm text-red-400 hover:bg-white/5 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm hover:bg-white/5"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm hover:bg-white/5"
                >
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
