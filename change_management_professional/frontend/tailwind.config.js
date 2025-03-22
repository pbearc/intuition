/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          // MSD Green color palette based on #007A73
          50: "#E6F3F2",
          100: "#CCE7E5",
          200: "#99CFCB",
          300: "#66B7B1",
          400: "#339F97",
          500: "#007A73", // Main MSD Green color
          600: "#006862",
          700: "#005651",
          800: "#004440",
          900: "#00332F",
        },
      },
    },
  },
  plugins: [],
};
