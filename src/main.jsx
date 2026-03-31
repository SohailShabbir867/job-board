/**
 * @file src/main.jsx
 * @description Application entry point.
 *
 * Bootstraps the React app by:
 *  1. Creating the React root attached to the <div id="root"> element in index.html.
 *  2. Wrapping the app in React.StrictMode for additional runtime warnings in development.
 *  3. Wrapping the app in BrowserRouter so all child components can use React Router hooks.
 *  4. Importing global CSS (Tailwind base styles via index.css).
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // Global styles — Tailwind CSS directives + any custom CSS

// Mount the React application into the root DOM node defined in index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  /**
   * React.StrictMode enables additional development-only checks:
   *  - Warns about deprecated lifecycle methods
   *  - Detects unexpected side effects by double-invoking render functions
   *  - Has no effect in production builds
   */
  <React.StrictMode>
    {/**
     * BrowserRouter provides the routing context for the entire app.
     * All <Routes>, <Route>, <Link>, and navigation hooks (useNavigate, useParams)
     * must be descendants of this component.
     */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
