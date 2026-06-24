import type { Config } from "tailwindcss";

/**
 * ParkGo brand system.
 * Colours: navy #0E2A47, blue #1B6CB3, green #36B24A, accent orange #E8842B.
 * Wordmark: "Park" (navy) + "Go" (green) — tagline "Park Smart. Travel Easy."
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0E2A47",
          50: "#eef3f8",
          100: "#d4e0ec",
          200: "#a9c1d9",
          300: "#7ea2c6",
          400: "#4e7ba8",
          500: "#2b557f",
          600: "#1d3f63",
          700: "#16314d",
          800: "#0E2A47",
          900: "#091d33",
          950: "#05111f",
        },
        brand: {
          DEFAULT: "#1B6CB3",
          50: "#eef6fc",
          100: "#d6e9f6",
          200: "#aed3ed",
          300: "#7fb6e0",
          400: "#4e93cf",
          500: "#1B6CB3",
          600: "#175a96",
          700: "#134878",
          800: "#10395f",
          900: "#0d2d4b",
        },
        go: {
          DEFAULT: "#36B24A",
          50: "#edfaef",
          100: "#d2f2d7",
          200: "#a6e4b1",
          300: "#70d184",
          400: "#4cc063",
          500: "#36B24A",
          600: "#2a9a3d",
          700: "#237a33",
          800: "#1f602c",
          900: "#1a4f26",
        },
        accent: {
          DEFAULT: "#E8842B",
          50: "#fdf3e9",
          100: "#fae0c6",
          200: "#f4c08c",
          300: "#ef9f52",
          400: "#E8842B",
          500: "#d06f1c",
          600: "#a85718",
          700: "#824315",
          800: "#5e3110",
          900: "#3f220c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,42,71,0.06), 0 8px 24px rgba(14,42,71,0.08)",
        "card-lg": "0 4px 12px rgba(14,42,71,0.08), 0 16px 48px rgba(14,42,71,0.12)",
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
