module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'helvetica', 'sans-serif'],
      },
      colors: {
        // Colores primarios
        'brand-blue': '#003d6f',
        'brand-green': '#00984a',
        // Colores secundarios
        'secondary-blue': '#0058b5',
        'secondary-green': '#69bf53',
        'secondary-yellow': '#fac84d',
        'secondary-orange': '#ff9c2f',
        // Colores terciarios
        'neutral-black': '#333333',
        'neutral-gray': '#7e7f74',
        'neutral-light': '#d7d1c5',
        'neutral-lighter': '#eae7e1',
        // Alias para usar en el sistema
        primary: '#003d6f',
        secondary: '#00984a',
        accent: '#0058b5',
        success: '#69bf53',
        warning: '#fac84d',
        danger: '#e74c3c',
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
        '5xl': ['48px', '1'],
        '6xl': ['60px', '1'],
      },
      fontWeight: {
        'extralight': 200,
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800,
        'black': 900,
      },
    },
  },
  plugins: [],
}
