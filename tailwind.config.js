module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './content/posts/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        graphite: '#23232a',
      },
      fontFamily: {
        editorial: ['Merriweather', 'serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
};