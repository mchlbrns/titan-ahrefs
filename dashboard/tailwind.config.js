/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Neon accent palette
        neon: {
          orange: '#FF6B35',
          cyan:   '#00D2FF',
          violet: '#8B5CF6',
          green:  '#10B981',
          rose:   '#F43F5E',
        },
        // Canvas / card hierarchy
        canvas: '#0a0b0e',
        card: {
          DEFAULT: '#131720',
          hover:   '#181e2b',
        },
        sidebar: '#0f1319',
        // Surface scale
        surface: {
          DEFAULT: '#111318',
          raised:  '#16191f',
          overlay: '#1c2028',
        },
        // Border tokens
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          subtle:  'rgba(255, 255, 255, 0.03)',
          strong:  'rgba(255, 255, 255, 0.12)',
          glow:    'rgba(0, 210, 255, 0.15)',
        },
        // Accent amber (sparingly: trends, alerts)
        accent: {
          DEFAULT: '#f59e0b',
          muted:   'rgba(245, 158, 11, 0.1)',
          border:  'rgba(245, 158, 11, 0.2)',
        },
        // Extended slate for text hierarchy
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#080d1a',
        },
      },
      fontSize: {
        'display':    ['clamp(2.25rem, 4vw, 3.25rem)', { lineHeight: '1',   letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-sm': ['clamp(1.5rem, 2.5vw, 2rem)',   { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
      },
      spacing: {
        '18': '4.5rem',
      },
      letterSpacing: {
        display: '-0.04em',
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.3)',
        float: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        'glow-cyan': '0 0 0 1px rgba(0,210,255,0.15), 0 4px 20px rgba(0,210,255,0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 200ms ease-out',
        'slide-up':   'slideUp 250ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
