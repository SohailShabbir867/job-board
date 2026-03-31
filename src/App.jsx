/**
 * @file src/App.jsx
 * @description Root application component.
 *
 * Responsibilities:
 *  - Wraps the entire UI tree with the AuthProvider (authentication state)
 *    and JobsProvider (job listing state) context providers.
 *  - Renders the persistent Navbar at the top and Footer at the bottom.
 *  - Declares all client-side routes using React Router v6 <Routes>.
 *
 * Route map:
 *  /            → Home       — landing page with hero section and stats
 *  /jobs        → Jobs       — job listing grid with search and modal preview
 *  /jobs/:id    → JobDetails — detailed view of a single job
 *  /post-job    → PostJob    — form to create a new job listing (auth required)
 *  /saved       → Saved      — user's bookmarked jobs (auth required)
 *  /signin      → SignIn     — login form
 *  /register    → Register   — account creation form
 *  *            → Home       — fallback for unknown routes
 */

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css"; // Ensure global styles are available (also imported in main.jsx for safety)

// ── Page Components ───────────────────────────────────────────────────────────
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import Saved from "./pages/Saved";
import SignIn from "./pages/signIn";
import Register from "./pages/Register";

// ── Context Providers ─────────────────────────────────────────────────────────
// AuthProvider   — manages JWT-based authentication state globally
// JobsProvider   — manages the job listing array fetched from the MongoDB API
import { JobsProvider } from "./context/JobsContext";
import { AuthProvider } from "./context/AuthContext";

/**
 * Root component that composes the full application layout and routing tree.
 * Must be rendered inside a <BrowserRouter> (handled in main.jsx).
 */
function App() {
  return (
    /**
     * AuthProvider must be the outermost provider so that the JobsProvider
     * (and all page components) can access the current user via useAuth().
     */
    <AuthProvider>
      {/**
       * JobsProvider fetches jobs on mount and shares them with the entire tree.
       * Placed inside AuthProvider so it could optionally filter jobs per user in future.
       */}
      <JobsProvider>
        {/* Full-height flex column keeps the footer pinned to the bottom */}
        <div className="flex flex-col min-h-screen">
          {/* Navbar is sticky and always rendered above page content */}
          <Navbar />

          {/* Main content area grows to fill remaining vertical space */}
          <main className="flex-grow w-full p-0">
            <Routes>
              {/* Public routes — accessible to everyone */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Semi-protected routes — accessible but with auth prompts */}
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/saved" element={<Saved />} />

              {/* Auth pages */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />

              {/* Fallback: redirect unknown paths to the home page */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Footer is always rendered at the bottom of the page */}
          <Footer />
        </div>
      </JobsProvider>
    </AuthProvider>
  );
}

export default App;
