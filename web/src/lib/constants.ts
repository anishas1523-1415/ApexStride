// Sport configurations
export const SPORTS = [
  {
    id: 'cricket',
    name: 'Cricket',
    description: 'Master batting and bowling techniques',
    color: 'sport-cricket',
    glowColor: 'glow-green',
    icon: '🏏',
    gradient: 'from-sport-cricket to-neon-green',
  },
  {
    id: 'football',
    name: 'Football',
    description: 'Improve shooting and passing accuracy',
    color: 'sport-football',
    glowColor: 'glow-blue',
    icon: '⚽',
    gradient: 'from-sport-football to-neon-blue',
  },
  {
    id: 'weightlifting',
    name: 'Weightlifting',
    description: 'Perfect your lifting form and strength',
    color: 'sport-weightlifting',
    glowColor: 'glow-lime',
    icon: '🏋️',
    gradient: 'from-sport-weightlifting to-neon-lime',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    description: 'Enhance your shots and footwork',
    color: 'sport-badminton',
    glowColor: 'glow-pink',
    icon: '🏸',
    gradient: 'from-sport-badminton to-neon-pink',
  },
  {
    id: 'running',
    name: 'Athlete Running',
    description: 'Optimize your running technique',
    color: 'sport-running',
    glowColor: 'glow-purple',
    icon: '🏃',
    gradient: 'from-sport-running to-neon-purple',
  },
] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  ANALYSIS: '/analysis',
  PROFILE: '/profile',
} as const;