/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens — resolved from CSS variables (see index.css).
        ink: 'var(--ink)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        muted: 'var(--muted)',
        dim: 'var(--dim)',
        hair: 'var(--hair)',
        hairlight: 'var(--hairlight)',
        // Brand / semantic colors — identical across light and dark.
        accent: '#7c6af7',
        ok: '#34d399',
        warn: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
