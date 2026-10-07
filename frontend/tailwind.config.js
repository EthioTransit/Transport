/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#087443',
          emerald: '#0B8F55',
          darkGreen: '#063B2A',
          gold: '#D9A441',
          softGold: '#F4D58D',
          bg: '#F7F9FC',
          dark: '#0B1220',
          textMain: '#111827',
          textMuted: '#667085',
          textLight: '#98A2B3',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB',
        }
      },
      borderRadius: {
        card: '20px',
        cardLg: '24px',
        btn: '12px',
        input: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        ethiopic: ['Noto Sans Ethiopic', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(11, 143, 85, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        cardHover: '0 12px 30px -4px rgba(11, 143, 85, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(11, 143, 85, 0.25)',
      },
      height: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
      minHeight: {
        '13': '3.25rem',
      },
    },
  },
  plugins: [],
}
