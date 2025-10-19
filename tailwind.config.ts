import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        red: {
          DEFAULT: '#E50914', // Netflix kırmızıya yakın örnek
          light: '#FF4C4C',
          dark: '#B80000'
        },
        yellow: {
          DEFAULT: '#FFD700',
          light: '#FFE94D',
          dark: '#BBA300'
        }
      }
    }
  },
  plugins: []
}

export default config
