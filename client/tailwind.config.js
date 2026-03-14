/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marvel: {
          red: '#ED1D24',
          darkred: '#B71C1C',
          gold: '#F5A623',
          dark: '#0D0D0D',
          card: '#1A1A2E',
          cardHover: '#16213E',
          border: '#2D2D4E',
        },
      },
      fontFamily: {
        marvel: ['Impact', 'Arial Black', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "radial-gradient(ellipse at top, #1a0a0a 0%, #0D0D0D 50%)",
      },
    },
  },
  plugins: [],
}
