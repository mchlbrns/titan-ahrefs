/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Single accent — amber. Used only for trends/alerts.
        accent: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.2)',
        },
        // Surface / background scale
        surface: {
          DEFAULT: '#111318',
          raised: '#16191f',
          overlay: '#1c2028',
        },
        // Custom border token
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          subtle: 'rgba(255, 255, 255, 0.03)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        // Extended slate for text hierarchy
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#080d1a',
        },
      },
      fontSize: {
        // Display size for hero KPI numbers
        'display': ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-sm': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
      },
      spacing: {
        '18': '4.5rem',
      },
      letterSpacing: {
        'display': '-0.04em',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
