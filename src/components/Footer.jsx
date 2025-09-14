// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

// Inline SVG icons used to avoid external react-icons dependency
const IconGithub = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5" {...props}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.805 1.304 3.49.997.108-.774.418-1.305.76-1.605-2.665-.303-5.466-1.334-5.466-5.93 0-1.31.47-2.381 1.235-3.221-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.005-.404 1.02.005 2.048.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.805 5.624-5.476 5.92.43.37.823 1.102.823 2.222 0 1.606-.014 2.902-.014 3.293 0 .32.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const IconLinkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H8.355V9h3.414v1.561h.049c.477-.9 1.637-1.85 3.369-1.85 3.602 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.07 2.07 0 11.001-4.141 2.07 2.07 0 010 4.141zM6.868 20.452H3.807V9h3.061v11.452z" />
  </svg>
);

const IconTwitter = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5" {...props}>
    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.95.564-2.005.974-3.127 1.195-.897-.959-2.178-1.559-3.594-1.559-2.723 0-4.928 2.205-4.928 4.917 0 .39.045.765.127 1.124C7.691 8.095 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.708.87 3.213 2.188 4.096-.807-.026-1.566-.247-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.6 3.416-1.68 1.316-3.809 2.101-6.102 2.101-.396 0-.79-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.496 14-13.986 0-.21 0-.423-.015-.634.961-.695 1.8-1.56 2.46-2.548l-.047-.02z" />
  </svg>
);

function Footer() {
  return (
    <footer className="bg-[#0b1220] text-gray-300 border-t border-white/10 mt-10">
      {/* Top Section */}
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold text-white">JobFinder</h2>
          <p className="mt-3 text-sm text-gray-400">
            Find your dream job or post opportunities.  
            Built with modern tech for the future of work.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-[#2563EB]">Home</Link></li>
            <li><Link to="/jobs" className="hover:text-[#2563EB]">Browse Jobs</Link></li>
            <li><Link to="/post-job" className="hover:text-[#2563EB]">Post a Job</Link></li>
            <li><Link to="/saved" className="hover:text-[#2563EB]">Saved Jobs</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-[#2563EB]">Help Center</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">FAQs</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connect with us</h3>
          <div className="flex gap-4 text-xl">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#2563EB]">
              <IconGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#2563EB]">
              <IconLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#2563EB]">
              <IconTwitter />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} JobFinder. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
