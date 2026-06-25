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
        // Dark Stadium - Primary theme
        'stadium-black': '#000000',
        'stadium-dark': '#0A0E1A',
        'stadium-darker': '#050810',
        'stadium-card': '#0F172A',
        'stadium-surface': '#1a2847',
        
        // Neon accents
        'neon-green': '#00FF00',
        'neon-cyan': '#00FFFF',
        'neon-lime': '#39FF14',
        'neon-purple': '#7700FF',
        'neon-pink': '#FF006E',
        'neon-blue': '#00D9FF',
        
        // Sport-specific colors
        'sport-cricket': '#1D9970',
        'sport-football': '#0066CC',
        'sport-weightlifting': '#D4AF37',
        'sport-badminton': '#FF1493',
        'sport-running': '#FF6B35',
        
        // Semantic colors
        primary: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'glass-dark': 'rgba(0, 0, 0, 0.3)',
      },
      borderColor: {
        'glow-green': '#00FF00',
        'glow-cyan': '#00FFFF',
      },
      backdropFilter: {
        'glass': 'blur(10px)',
        'glass-sm': 'blur(4px)',
        'glass-md': 'blur(12px)',
        'glass-lg': 'blur(20px)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 0, 0.4), 0 0 40px rgba(0, 255, 0, 0.2)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)',
        'glow-lime': '0 0 20px rgba(57, 255, 20, 0.4), 0 0 40px rgba(57, 255, 20, 0.2)',
        'glow-purple': '0 0 20px rgba(119, 0, 255, 0.4), 0 0 40px rgba(119, 0, 255, 0.2)',
        'glow-pink': '0 0 20px rgba(255, 0, 110, 0.4), 0 0 40px rgba(255, 0, 110, 0.2)',
        'glow-blue': '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'bat-swing': 'bat-swing 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-goal': 'bounce-goal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'lift-motion': 'lift-motion 1s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 0, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 0, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bat-swing': {
          '0%': { transform: 'rotate(-45deg) scale(0.8)', opacity: '0' },
          '50%': { transform: 'rotate(0deg) scale(1)' },
          '100%': { transform: 'rotate(45deg) scale(0.8)', opacity: '0' },
        },
        'bounce-goal': {
          '0%': { transform: 'translateY(-100px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'lift-motion': {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.glow-green': {
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.4), 0 0 40px rgba(0, 255, 0, 0.2), inset 0 0 20px rgba(0, 255, 0, 0.1)',
        },
        '.glow-cyan': {
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.1)',
        },
        '.glow-lime': {
          boxShadow: '0 0 20px rgba(57, 255, 20, 0.4), 0 0 40px rgba(57, 255, 20, 0.2), inset 0 0 20px rgba(57, 255, 20, 0.1)',
        },
        '.glow-purple': {
          boxShadow: '0 0 20px rgba(119, 0, 255, 0.4), 0 0 40px rgba(119, 0, 255, 0.2), inset 0 0 20px rgba(119, 0, 255, 0.1)',
        },
        '.glow-pink': {
          boxShadow: '0 0 20px rgba(255, 0, 110, 0.4), 0 0 40px rgba(255, 0, 110, 0.2), inset 0 0 20px rgba(255, 0, 110, 0.1)',
        },
        '.neon-text-green': {
          color: '#00FF00',
          textShadow: '0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4)',
        },
        '.neon-text-cyan': {
          color: '#00FFFF',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;