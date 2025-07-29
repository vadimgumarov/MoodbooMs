/** @type {import('tailwindcss').Config} */
const { tailwindTokens } = require('./src/design-system/tailwind-tokens');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: tailwindTokens.colors,
      spacing: tailwindTokens.spacing,
      fontSize: tailwindTokens.fontSize,
      fontFamily: tailwindTokens.fontFamily,
      boxShadow: tailwindTokens.boxShadow,
    },
  },
  plugins: [],
}