/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        ambient: '0 24px 80px rgba(15, 23, 42, 0.14)',
        panel: '0 18px 50px rgba(15, 23, 42, 0.08)'
      },
      colors: {
        ink: 'var(--color-text)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        line: 'var(--color-line)',
        brand: 'var(--color-brand)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warn: 'var(--color-warn)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
};
