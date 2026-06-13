/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#faf9f6",
          100: "#f6f4ef",
          200: "#ece7dd",
          300: "#ddd5c5",
        },
        sage: {
          50: "#eef4f3",
          100: "#dbe9e7",
          400: "#6fa39b",
          500: "#4f7c83",
          600: "#3f656b",
          700: "#324f54",
        },
        bloom: {
          400: "#e6a17a",
          500: "#d98860",
        },
      },
      fontFamily: {
        sans: [
          "ui-rounded",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(50, 79, 84, 0.18)",
        card: "0 2px 12px -4px rgba(50, 79, 84, 0.14)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
