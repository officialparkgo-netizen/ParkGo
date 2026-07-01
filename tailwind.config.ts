import type { Config } from "tailwindcss";

/**
 * ParkGo brand system — orange & black.
 * Palette: orange #F26A1B (primary accent), black #15171A (primary dark),
 * white surfaces, neutral greys for secondary text/borders.
 *
 * Tokens are semantic so the whole app + website inherit the theme from here:
 *   navy   → ink/charcoal→black neutral scale (text, dark surfaces, borders)
 *   brand  → orange (primary accent)
 *   accent → orange (highlights)
 *   go     → orange (primary CTAs & positive/"live" states — no green in the brand)
 * (Names kept stable to avoid churning class names across the app.)
 */
const orange = {
  DEFAULT: "#F26A1B",
  50: "#FEF3EC",
  100: "#FCE1CF",
  200: "#F9C3A0",
  300: "#F6A06B",
  400: "#F5843A",
  500: "#F26A1B",
  600: "#D4560F",
  700: "#A9430C",
  800: "#83350C",
  900: "#6B2C0D",
  950: "#3A1604",
};

const ink = {
  DEFAULT: "#15171A",
  50: "#F6F7F8",
  100: "#ECEDEF",
  200: "#D6D8DC",
  300: "#B2B6BD",
  400: "#878D96",
  500: "#5B616B",
  600: "#3D424A",
  700: "#2A2E34",
  800: "#1E2126",
  900: "#15171A",
  950: "#0C0D0F",
};

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: ink,
        brand: orange,
        go: orange,
        accent: orange,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,23,26,0.06), 0 8px 24px rgba(21,23,26,0.08)",
        "card-lg": "0 4px 12px rgba(21,23,26,0.08), 0 16px 48px rgba(21,23,26,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
