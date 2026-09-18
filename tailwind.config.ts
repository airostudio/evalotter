import type { Config } from "tailwindcss";

/**
 * EvalOtter design tokens — light, warm, calm.
 *
 * The token NAMES are unchanged from the previous dark theme on purpose:
 * roughly 800 usages across the app already reference them semantically
 * (`ink` = surfaces, `paper` = text, `signal` = accents), so the whole
 * interface re-themes from this one file rather than from hundreds of
 * per-page edits.
 *
 * `ink` runs lightest at 950 (the page) to strongest at 500 (a hover
 * border). That direction is inherited: the old theme used bg-ink-950 for
 * the page and border-ink-500 for the most visible border, so keeping the
 * scale pointing the same way means every existing class lands correctly.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces. Warm off-white rather than grey — grey reads clinical,
        // and a little cream is what makes the page feel calm rather than
        // blank.
        ink: {
          950: "#fcfaf6", // page
          900: "#f6f3ec", // subtle band / alternate section
          800: "#ffffff", // card surface (translucent variants lift toward white)
          700: "#ece7dd", // hairline
          600: "#e1dbd0", // border
          500: "#c6bdae", // hover / stronger border
        },
        // Text. Dark charcoal, never pure black — black on cream is harsh
        // and makes long reading tiring.
        paper: {
          100: "#33383e", // primary text
          50: "#ffffff", // text on a coloured fill
        },
        signal: {
          blue: "#3c6fb0", // primary action; carries white text at ~4.8:1
          teal: "#137a75", // accent, links, highlights
          green: "#4f8a5b", // positive / success
          amber: "#b9781f", // caution
          rose: "#b4484b", // error — readable on a light background
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Soft and low-contrast. The old panel shadow was a heavy dark drop
        // designed to lift a card off a near-black page; on cream the same
        // weight looks like dirt.
        panel: "0 1px 2px 0 rgba(51,56,62,0.04), 0 12px 32px -12px rgba(51,56,62,0.10)",
        soft: "0 1px 2px 0 rgba(51,56,62,0.03), 0 6px 18px -8px rgba(51,56,62,0.08)",
        lift: "0 2px 4px 0 rgba(51,56,62,0.04), 0 18px 40px -16px rgba(51,56,62,0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
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
