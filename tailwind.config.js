/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        industrial: {
          50: "#e6f0ff",
          100: "#b3d1ff",
          200: "#80b3ff",
          300: "#4d94ff",
          400: "#1a75ff",
          500: "#165DFF",
          600: "#0e47cc",
          700: "#0a3599",
          800: "#072466",
          900: "#031233",
        },
        dark: {
          50: "#f2f3f5",
          100: "#e5e6eb",
          200: "#c9cdd4",
          300: "#86909c",
          400: "#4e5969",
          500: "#272e3b",
          600: "#1d2129",
          700: "#171a1f",
          800: "#0f1115",
          900: "#090a0d",
        },
        success: {
          500: "#00B42A",
          600: "#009a24",
        },
        warning: {
          500: "#FF7D00",
          600: "#d96a00",
        },
        danger: {
          500: "#F53F3F",
          600: "#d93636",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "marquee": "marquee 20s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(22, 93, 255, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(22, 93, 255, 0.8)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
