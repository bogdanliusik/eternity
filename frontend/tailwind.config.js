import PrimeUI from 'tailwindcss-primeui';

export default {
  darkMode: ['selector', '[class="eternity-dark"]'],
  content: ["./src/**/*.{html,css,ts}"],
  plugins: [PrimeUI],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1920px'
    }
  }
};
