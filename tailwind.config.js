/** @type {import('tailwindcss').Config} */
export default {
  content: [
        "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6',  // blue-500
          dark: '#1e40af',   // blue-800
        },
        secondary: {
          DEFAULT: '#f59e42', // orange-400
          light: '#fbbf24',  // orange-300
          dark: '#b45309',   // orange-800
        },
        accent: {
          DEFAULT: '#10b981', // emerald-500
          light: '#6ee7b7',  // emerald-300
          dark: '#047857',   // emerald-800
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

