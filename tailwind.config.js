/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'subway-blue': '#001D31',
        'subway-light-blue': '#003366',
        'subway-accent': '#004080',
        'subway-hover': '#0059b3',
        'subway-gray': '#BDCBD2',
        'subway-gray-hover': '#c5e3ef',
      },
      spacing: {
        '25px': '25px',
        '5px': '5px',
        '15px': '15px',
      },
      height: {
        '150px': '150px',
        '60px': '60px',
      },
    },
  },
  plugins: [],
}