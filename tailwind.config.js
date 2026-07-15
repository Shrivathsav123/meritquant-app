/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          base: '#020205',
          surface: '#06070D',
          surfaceMuted: '#0D0E16',
        },
        catalyst: {
          DEFAULT: '#7A12FF',
          glow: '#B026FF',
          light: '#C47CFF',
        },
        bull: {
          DEFAULT: '#00F29B',
          glow: '#0DF5A6',
          text: '#A3FFE3',
        },
        bear: {
          DEFAULT: '#FF0844',
          glow: '#FF4E50',
          text: '#FFC5D3',
        },
        system: {
          amber: '#FF9F00',
          slate: '#4E5D6C',
          slateMuted: '#1C252E',
        },
      },
      fontFamily: {
        telemetry: ['Geist Mono', 'JetBrains Mono', 'monospace'],
        interface: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
        'purple-glow': '0 0 20px 0 rgba(122, 18, 255, 0.15)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
