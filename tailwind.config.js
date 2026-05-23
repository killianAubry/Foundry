/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"SFMono-Regular"', 'Consolas', 'monospace'],
      },
      colors: {
        ink: '#F2F2F2',
        muted: '#888888',
        dim: '#555555',
        canvas: '#1E1E1E',
        panel: '#181818',
        elevated: '#262626',
        grid: '#2A2A2A',
        hover: '#333333',
        active: '#404040',
        yellow: '#E5C07B',
        redline: '#E06C6C',
        violet: '#B78FD4',
        greenline: '#9CC88E',
        teCream: '#E9E5D8',
        teRed: '#FF4A37',
        teBlue: '#7BB7C7',
      },
    },
  },
  plugins: [],
};
