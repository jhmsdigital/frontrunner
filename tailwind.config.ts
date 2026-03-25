import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ms-navy': '#00476C',
        'ms-oceanBlue': '#217CA1',
        'ms-gray': '#5A5B5D',
        'ms-gold': '#A38D31',
        'ms-yellow': '#DAC556',
        'ms-lightGray': '#A4A7A9',
        'ms-skyBlue': '#8BC6E8',
      },
      fontFamily: {
        sans: ['"Sofia Sans"', 'sans-serif'],
        serif: ['"STIX Two Text"', 'serif'],
        condensed: ['"Sofia Sans Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
