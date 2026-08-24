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
        // Brand palette — only 3 hues allowed:
        // green  #27AE60, blue #2980B9, teal #1ABC9C
        // All tints/shades below are derived from these.
        moodsoft: '#0B2434',       // dark neutral from blue family (headings, dark buttons)
        sophisticated: '#3A7399',  // secondary text / muted (blue family)
        maroon: '#27AE60',         // primary accent (green)
        maroonDark: '#1C7D45',     // accent hover (green shade)
        pale: '#F6FAFC',           // light backgrounds (blue tint)

        // Green scale (#27AE60)
        brand: {
          50: '#F2FAF5',
          100: '#E1F4E9',
          200: '#C3E8D2',
          300: '#97D8B3',
          400: '#5FC389',
          500: '#27AE60',
          600: '#229653',
          700: '#1C7D45',
          800: '#176538',
          900: '#104928',
        },

        // Neutral ramp derived from blue (#2980B9 + white/black mixing)
        slate: {
          50: '#F6FAFC',
          100: '#ECF4F9',
          200: '#D8E8F2',
          300: '#9FC6E0',
          400: '#3A7399',
          500: '#194F73',
          600: '#15405D',
          700: '#0B2434',
          800: '#071721',
          900: '#050E14',
        },

        // Primary accent → green family
        rose: {
          50: '#F2FAF5',
          100: '#E1F4E9',
          200: '#C3E8D2',
          300: '#97D8B3',
          400: '#5FC389',
          500: '#27AE60',
          600: '#229653',
          700: '#1C7D45',
          800: '#176538',
          900: '#104928',
        },
        emerald: {
          50: '#F2FAF5',
          100: '#E1F4E9',
          200: '#C3E8D2',
          300: '#97D8B3',
          400: '#5FC389',
          500: '#27AE60',
          600: '#229653',
          700: '#1C7D45',
          800: '#176538',
          900: '#104928',
        },

        // Info/secondary → blue family
        blue: {
          50: '#F2F7FB',
          100: '#E1EDF5',
          200: '#C3DBEB',
          300: '#98C2DD',
          400: '#61A1CB',
          500: '#2980B9',
          600: '#236E9F',
          700: '#1E5C85',
          800: '#184A6B',
          900: '#11364E',
        },
        sky: {
          50: '#F2F7FB',
          100: '#E1EDF5',
          200: '#C3DBEB',
          300: '#98C2DD',
          400: '#61A1CB',
          500: '#2980B9',
          600: '#236E9F',
          700: '#1E5C85',
          800: '#184A6B',
          900: '#11364E',
        },

        // Highlights/badges → teal family
        purple: {
          50: '#F1FBF9',
          100: '#DFF6F1',
          200: '#BFECE3',
          300: '#91DFCF',
          400: '#56CDB6',
          500: '#1ABC9C',
          600: '#16A286',
          700: '#138770',
          800: '#0F6D5A',
          900: '#0B4F42',
        },
        amber: {
          50: '#F1FBF9',
          100: '#DFF6F1',
          200: '#BFECE3',
          300: '#91DFCF',
          400: '#56CDB6',
          500: '#1ABC9C',
          600: '#16A286',
          700: '#138770',
          800: '#0F6D5A',
          900: '#0B4F42',
        },
      },
    },
  },
  plugins: [],
}
