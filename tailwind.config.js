/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#00d4ff",
                "cyan-accent": "#00d4ff",
                "accent-blue": "#007bff",
                "background-light": "#f5f7f8",
                "background-dark": "#050510",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "syne": ["Syne", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "1.5rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
  }
