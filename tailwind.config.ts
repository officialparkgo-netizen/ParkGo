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
 *
 * ── Contrast rules, all measured, all currently holding at AA ──────────────
 * Greys: navy-400 is the lightest ink allowed on white / navy-50 (4.98:1) and
 * the lightest allowed anywhere. On navy-900 surfaces it flips — navy-400 only
 * manages 3.6:1 there, so dark cards use navy-200 (12.58:1). Do not lighten
 * navy-400 and do not use navy-300 as ink.
 *
 * Orange, on white:      500 = 3.06:1  ·  600 = 4.09:1  ·  700 = 6.01:1
 * Orange, on navy-50:    500 = 2.86:1  ·  600 = 3.81:1  ·  700 = 5.60:1
 * Dark text on orange:   navy-900 on 500 = 5.86:1  ·  on 400 = 7.05:1
 *
 * Which means:
 *   · Orange TEXT must be 700. (600 clears white but not 12px on white, and
 *     not the tinted -50 surfaces at all.)
 *   · Orange ICONS may be 600 — graphical objects only need 3:1.
 *   · Orange BACKGROUNDS carry navy-900 text, never white: #F26A1B with white
 *     is 3.06:1, and no orange light enough to still read as "ParkGo orange"
 *     will ever clear 4.5:1 with white. Hover therefore *lightens* (500→400).
 *   · On the dark CTA gradient (brand-700 → navy-800) it inverts again: text
 *     needs orange-100 (4.81:1 on the band's lightest stop) and icons
 *     orange-200 (3.82:1).
 *
 * scripts/a11y/contrast-all.mjs walks every page in a real browser and checks
 * both floors — text at 4.5:1 (3:1 once large) and icons at 3:1 — resolving
 * gradient bands by their worst stop. Run it after touching any of this.
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
  400: "#6B7078",
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
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
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
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
        shimmer: "shimmer 1.6s infinite",
        "fade-in": "fade-in 0.2s ease-out both",
        "slide-in-right": "slide-in-right 0.28s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.18s ease-out both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
