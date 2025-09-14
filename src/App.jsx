// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import Saved from "./pages/Saved";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";

// Context Providers
import { JobsProvider } from "./context/JobsContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <JobsProvider>
        <div className="flex flex-col min-h-screen">
          {/* Navbar always on top */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-grow w-full p-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/saved" element={<Saved />} />

              {/* Auth Pages */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>

          {/* Footer always at bottom */}
          <Footer />
        </div>
      </JobsProvider>
    </AuthProvider>
  );
}

export default App;
