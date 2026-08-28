/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#FFF7FA',
          100: '#FFEDF4',
          200: '#FFD6E6',
          300: '#FDB8D2',
          400: '#F98FB8',
          500: '#F0669C',
          600: '#DB3F7D',
          700: '#B92C63',
          800: '#93214E',
          900: '#6E1839',
        },
        plum: {
          50: '#F8F3F7',
          100: '#EFE2EC',
          200: '#DCC0D6',
          300: '#C296B9',
          400: '#A06894',
          500: '#7E4472',
          600: '#63305A',
          700: '#4C2246',
          800: '#371833',
          900: '#241021',
        },
        gold: {
          100: '#FBF3DF',
          200: '#F4E2B4',
          300: '#E9CC82',
          400: '#D9B25A',
          500: '#C2953B',
          600: '#A2782C',
          700: '#7D5C21',
        },
        cream: '#FFFBF7',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Parisienne', 'cursive'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(110, 24, 57, 0.16)',
        lift: '0 18px 40px -18px rgba(110, 24, 57, 0.34)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
