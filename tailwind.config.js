/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        amhc: {
          green:  '#006847',
          dark:   '#004f36',
          light:  '#008a5e',
          black:  '#101010',
          gray:   '#46484a',
          bg:     '#f2f2f2',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
