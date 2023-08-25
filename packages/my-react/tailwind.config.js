/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "landing-page": "url('/src/assets/landing-page.png')')",
      },
    },
  },
  plugins: [],
};
