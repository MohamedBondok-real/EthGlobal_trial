/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#08060B',
        card: '#120D1A',
        sunset: {
          orange: '#FF5722',
          amber: '#F59E0B',
          coral: '#FF6F61',
          pink: '#EC4899',
          rose: '#F43F5E',
          magenta: '#D946EF',
          purple: '#A855F7',
          violet: '#8B5CF6',
        },
      },
      backgroundImage: {
        'gradient-sunset': 'linear-gradient(135deg, #FF5722 0%, #EC4899 50%, #8B5CF6 100%)',
        'gradient-sunset-soft': 'linear-gradient(135deg, rgba(255,87,34,0.15) 0%, rgba(236,72,153,0.15) 50%, rgba(139,92,246,0.15) 100%)',
        'gradient-orange-pink': 'linear-gradient(to right, #FF5722, #EC4899)',
        'gradient-pink-purple': 'linear-gradient(to right, #EC4899, #8B5CF6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-sunset': 'glowSunset 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glowSunset: {
          '0%': { boxShadow: '0 0 15px rgba(255, 87, 34, 0.35)' },
          '100%': { boxShadow: '0 0 30px rgba(236, 72, 153, 0.65)' },
        }
      }
    },
  },
  plugins: [],
};
