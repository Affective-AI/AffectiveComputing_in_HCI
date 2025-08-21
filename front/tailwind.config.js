/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          brand: {
            50:  "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5",
            700: "#4338ca",
            800: "#3730a3",
            900: "#312e81",
          },
          ink: {
            50:"#f8fafc", 100:"#f1f5f9", 200:"#e2e8f0", 300:"#cbd5e1", 400:"#94a3b8",
            500:"#64748b", 600:"#475569", 700:"#334155", 800:"#1f2937", 900:"#0f172a"
          }
        },
        boxShadow: {
          soft: "0 2px 10px rgba(2,6,23,0.06), 0 12px 24px rgba(2,6,23,0.06)",
          glow: "0 0 0 4px rgba(99,102,241,0.15)"
        },
        borderRadius: { xl2: "1.25rem" },
        backgroundImage: {
          "grid-soft":
            "radial-gradient(circle at 1px 1px, rgba(99,102,241,.08) 1px, transparent 0)",
          "radial-spot":
            "radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,.12), transparent), radial-gradient(900px 400px at 110% 10%, rgba(139,92,246,.10), transparent)"
        }
      },
    },
    plugins: [],
  }
  