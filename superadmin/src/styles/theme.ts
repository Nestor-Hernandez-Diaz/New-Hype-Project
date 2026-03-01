export const COLORS = {
  // Brand — negro como AplicacionCliente
  primary: '#000000',
  primaryDark: '#333333',
  primaryLight: '#525252',
  
  // Neutrals
  text: '#0a0a0a',
  textLight: '#525252',
  textLighter: '#a3a3a3',
  
  // Backgrounds
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceHover: '#f5f5f5',
  
  // Status
  success: '#22c55e',
  successLight: '#f0fdf4',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fef2f2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  
  // Borders
  border: '#e5e5e5',
  borderDark: '#d4d4d4',
  
  // States
  active: '#22c55e',
  suspended: '#f59e0b',
  inactive: '#525252',
} as const;

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: 'Menlo, Monaco, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const SHADOWS = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 20px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 40px rgba(0, 0, 0, 0.12)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '50%',
} as const;

export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

export const TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

