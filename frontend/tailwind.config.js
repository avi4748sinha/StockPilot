/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#374151",
        accent: "#60A5FA",
        surface: "#FFFFFF",
        text: "#111827",
        muted: "#6B7280",
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
