import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        finopt: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc2fb",
          400: "#36a2f6",
          500: "#0c85eb",
          600: "#0067ca",
          700: "#0152a3",
          800: "#054686",
          900: "#0a3b6f",
          950: "#07264a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
