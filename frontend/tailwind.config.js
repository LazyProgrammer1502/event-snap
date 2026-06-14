/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1e1b2e",
        coral: "#f0567a",
        amber: "#ffb347",
        canvas: "#faf7f5",
        muted: "#6b6478",
      },
    },
  },
  plugins: [],
};
