/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f0ff',
          purple: '#b400ff',
          pink: '#ff006e',
          lime: '#39ff14',
          blue: '#0080ff',
        },
        dark: {
          bg: {
            DEFAULT: '#0a0e27',
            50: 'rgba(10, 14, 39, 0.5)',
            80: 'rgba(10, 14, 39, 0.8)',
          },
          card: {
            DEFAULT: '#1a1f3a',
            50: 'rgba(26, 31, 58, 0.5)',
            80: 'rgba(26, 31, 58, 0.8)',
          },
          border: {
            DEFAULT: '#2d3561',
            50: 'rgba(45, 53, 97, 0.5)',
            80: 'rgba(45, 53, 97, 0.8)',
          },
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 20px rgba(0, 240, 255, 0.5)' },
          '50%': { textShadow: '0 0 40px rgba(0, 240, 255, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.6)' },
        },
        orbit: {
          'from': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          'to': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
