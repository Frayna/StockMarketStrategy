/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for the stock market app
        'stock-green': '#22c55e',
        'stock-red': '#ef4444',
        'stock-blue': '#3b82f6',
      },
    },
  },
  plugins: [],
}
