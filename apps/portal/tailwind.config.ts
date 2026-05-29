import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0078D4',
          50: '#EBF4FF',
          100: '#CCE4FF',
          200: '#99C8FF',
          300: '#66ABFF',
          400: '#338FFF',
          500: '#0078D4',
          600: '#005FA3',
          700: '#004578',
          800: '#002C4D',
          900: '#001629',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
