/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Faction badge colors - required because classes are looked up dynamically
    'text-blue-400', 'bg-blue-900/30', 'border-blue-700',   // Agents
    'text-cyan-400', 'bg-cyan-900/30', 'border-cyan-700',   // Asgardian
    'text-blue-300', 'bg-blue-800/30', 'border-blue-600',   // Avengers
    'text-red-400', 'bg-red-900/30', 'border-red-700',      // Brotherhood / Spider-Verse
    'text-teal-400', 'bg-teal-900/30', 'border-teal-700',   // Collaboration
    'text-rose-400', 'bg-rose-900/30', 'border-rose-700',   // Deadpool Corps
    'text-purple-400', 'bg-purple-900/30', 'border-purple-700', // Dark Dimension
    'text-amber-400', 'bg-amber-900/30', 'border-amber-700', // Eternals
    'text-green-400', 'bg-green-900/30', 'border-green-700', // Guardians
    'text-red-600', 'bg-red-950/30', 'border-red-800',      // Hydra
    'text-indigo-400', 'bg-indigo-900/30', 'border-indigo-700', // Intergalactic War
    'text-gray-400', 'bg-gray-900/30', 'border-gray-700',   // Marvel Knights
    'text-violet-400', 'bg-violet-900/30', 'border-violet-700', // Mystics
    'text-slate-400', 'bg-slate-900/30', 'border-slate-600', // Neutral
    'text-orange-400', 'bg-orange-900/30', 'border-orange-700', // Ragnarok
    'text-blue-200', 'bg-blue-950/30', 'border-blue-800',   // S.H.I.E.L.D.
    'text-pink-400', 'bg-pink-900/30', 'border-pink-700',   // Special
    'text-yellow-400', 'bg-yellow-900/30', 'border-yellow-700', // Stark Industries
    'text-yellow-300', 'bg-yellow-900/30', 'border-yellow-600', // X-Men
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
