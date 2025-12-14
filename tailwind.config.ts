import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0f0f0f",
          light: "#1a1a1a",
        },
        primary: {
          DEFAULT: "#722F37",
          light: "#8B3A44",
          dark: "#5A252C",
        },
        secondary: {
          DEFAULT: "#A07855",
          light: "#B8906F",
          dark: "#8A6644",
        },
        text: {
          DEFAULT: "#F5F5F5",
          muted: "#D4D4D4",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;



