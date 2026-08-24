import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0d16",
          800: "#0f1420",
          700: "#161c2c",
          600: "#20293d",
          500: "#2c3752",
        },
        paper: {
          50: "#faf8f3",
          100: "#f3efe4",
        },
        brand: {
          50: "#eef1ff",
          100: "#e0e4ff",
          300: "#a5b0f7",
          400: "#818ef2",
          500: "#5b63e6",
          600: "#4548d1",
          700: "#3736ab",
          900: "#1c1c56",
        },
        signal: {
          violet: "#7c5cff",
          cyan: "#5ce1e6",
          blue: "#3d7cff",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
