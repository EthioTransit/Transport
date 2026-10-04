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
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          dark: '#0B1220',
          slate: '#0F172A',
          textMain: '#0F172A',
          textMuted: '#64748B',
          textLight: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB',
        }
      },
      borderRadius: {
        card: '18px',
        cardLg: '22px',
        btn: '10px',
        input: '10px',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        ethiopic: ['Noto Sans Ethiopic', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        cardHover: '0 12px 30px -4px rgba(11, 143, 85, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(11, 143, 85, 0.25)',
      }
    },
  },
  plugins: [],
}
