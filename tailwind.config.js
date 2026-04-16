/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#fff8f0',
          100: '#ffe8cc',
          200: '#ffd199',
          300: '#ffb366',
          400: '#ff9933',
          500: '#e67e00',
          600: '#cc6600',
          700: '#994d00',
          800: '#663300',
          900: '#331a00',
        },
        maroon: {
          50:  '#fdf2f2',
          100: '#f9d6d6',
          200: '#f0a0a0',
          300: '#e06060',
          400: '#cc2a2a',
          500: '#8B0000',
          600: '#700000',
          700: '#550000',
          800: '#3a0000',
          900: '#1f0000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      }
    }
  },
  plugins: []
}
