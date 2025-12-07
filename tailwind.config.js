/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        primary: '#18181b', // Zinc 900 (Luxury Dark)
        secondary: '#ca8a04', // Yellow 600 (Gold Accent)
      }
    },
  },
  plugins: [],
}