/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        moodsoft: '#262626',       // dark neutral (headings, dark buttons)
        sophisticated: '#575757',  // secondary text / muted gray
        maroon: '#7a3b3b',         // primary accent
        maroonDark: '#5c2d2d',     // accent hover
        pale: '#f8f5f5',           // light backgrounds

        brand: {
          50: '#f8f5f5',
          100: '#f0e8e8',
          200: '#e3d4d4',
          300: '#c99b9b',
          400: '#8f5555',
          500: '#7a3b3b',
          600: '#7a3b3b',
          700: '#5c2d2d',
          800: '#4a2424',
          900: '#381b1b',
        },

        // Remap default scales to the neutral/maroon palette
        slate: {
          50: '#f8f5f5',
          100: '#f2eded',
          200: '#e6dfdf',
          300: '#c9c1c1',
          400: '#575757',
          500: '#575757',
          600: '#575757',
          700: '#262626',
          800: '#262626',
          900: '#262626',
        },
        rose: {
          50: '#f8f5f5',
          100: '#f0e8e8',
          200: '#e3d4d4',
          300: '#c99b9b',
          400: '#8f5555',
          500: '#7a3b3b',
          600: '#7a3b3b',
          700: '#5c2d2d',
          800: '#4a2424',
          900: '#381b1b',
        },
        blue: {
          50: '#f8f5f5',
          100: '#f0e8e8',
          200: '#e3d4d4',
          300: '#c99b9b',
          400: '#8f5555',
          500: '#7a3b3b',
          600: '#7a3b3b',
          700: '#5c2d2d',
          800: '#4a2424',
          900: '#381b1b',
        },
        purple: {
          50: '#f7f6f6',
          100: '#efeded',
          200: '#e0dbdb',
          300: '#bdb5b5',
          400: '#8a8484',
          500: '#575757',
          600: '#575757',
          700: '#262626',
          800: '#262626',
          900: '#262626',
        },
        emerald: {
          50: '#f8f5f5',
          100: '#f2eded',
          200: '#e6dfdf',
          300: '#c9c1c1',
          400: '#8a8484',
          500: '#575757',
          600: '#575757',
          700: '#3f3f3f',
          800: '#262626',
          900: '#262626',
        },
        amber: {
          50: '#f8f5f5',
          100: '#f2eded',
          200: '#e6dfdf',
          300: '#c9c1c1',
          400: '#8a8484',
          500: '#575757',
          600: '#575757',
          700: '#3f3f3f',
          800: '#262626',
          900: '#262626',
        },
      },
    },
  },
  plugins: [],
}
