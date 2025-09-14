// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",    // main blue accent
        accent: "#60A5FA",     // lighter blue
        surface: "#071026",    // page background
      }
    }
  },
  plugins: [],
};
