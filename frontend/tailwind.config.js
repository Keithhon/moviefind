/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF", // Deep blue
        secondary: "#6B7280", // Gray
        dark: "#111827", // Near-black for dark mode
        "dark-card": "#1F2937", // Dark card background
      },
    },
  },
  plugins: [],
}
