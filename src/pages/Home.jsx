/**
 * @file src/pages/Home.jsx
 * @description Landing / hero page for the Job Board application.
 *
 * Renders a full-screen hero section with:
 *  - A high-quality background photo overlay
 *  - A bold headline and supporting description
 *  - Two animated stat cards (Jobs Available, Companies Hiring)
 *  - A bottom call-to-action hint
 *
 * This component is entirely presentational — it has no side effects,
 * no API calls, and no local state.
 */

import React from "react";
import { Link } from "react-router-dom";

/**
 * Hero landing page component.
 * Route: /
 */
const Home = () => {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-[#050b1b]/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b1b]/20 via-[#050b1b]/60 to-[#050b1b]" />

      {/* Main content — sits above the overlay using relative positioning + z-index */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 md:px-8">

        {/* ── Main Headline ─────────────────────────────────────────────── */}
        {/* Font size scales responsively from mobile (2xl) to desktop (7xl) */}
        <h1 className="max-w-5xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          Find Your <span className="text-blue-400 block sm:inline">Dream Job</span> Today
        </h1>

        {/* ── Supporting Description ────────────────────────────────────── */}
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-gray-200 sm:text-base md:text-lg lg:text-xl">
          Explore thousands of job opportunities from top companies and start
          your career journey with us.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/jobs"
            className="rounded-lg bg-[#2563EB] px-6 py-3 font-medium text-white transition hover:bg-[#1D4ED8]"
          >
            Explore Jobs
          </Link>
          <Link
            to="/post-job"
            className="rounded-lg border border-white/25 bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20"
          >
            Post a Job
          </Link>
        </div>

        {/* ── Stats Grid ────────────────────────────────────────────────── */}
        {/*
         * Two stat cards displayed side-by-side on sm+ screens.
         * Each card uses a glassmorphism style (white/20 + backdrop-blur)
         * and scales up slightly on hover for a polished interaction.
         */}
        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">

          {/* Jobs Available Stat */}
          <div className="rounded-xl border border-white/20 bg-white/15 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/25">
            <h2 className="mb-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              10,000+
            </h2>
            <p className="text-sm font-medium text-gray-200 md:text-base">
              Jobs Available
            </p>
          </div>

          {/* Companies Hiring Stat */}
          <div className="rounded-xl border border-white/20 bg-white/15 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/25">
            <h2 className="mb-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              500+
            </h2>
            <p className="text-sm font-medium text-gray-200 md:text-base">
              Companies Hiring
            </p>
          </div>
        </div>

        {/* ── Bottom CTA hint ──────────────────────────────────────────── */}
        <div className="mt-10">
          <p className="max-w-lg text-xs text-gray-300 sm:text-sm md:text-base">
            Join thousands of job seekers who found their perfect match
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
