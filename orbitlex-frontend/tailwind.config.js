/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void':   '#050A14',
        'cosmos': '#0A1628',
        'card':   '#0D1B3E',
        'cyan':   '#00C2FF',
        'orbit':  '#0057FF',
        'nebula': '#7B5EA7',
        'gold':   '#FFB347',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    }
  },
  plugins: [],
}
