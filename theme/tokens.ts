export const tokens = {
  colors: {
    primary: '#5DC2F2',
    secondary: '#FFA8F3',
    accent: '#FFD166',
    background: '#0B1021',
    surface: '#151B32',
    card: '#1C2442',
    overlay: 'rgba(12,16,35,0.72)',
    border: '#2E3A68',
    highlight: '#7C98FF',
    text: {
      primary: '#F8FBFF',
      secondary: '#B7C4EE',
      muted: '#8591C2',
      inverse: '#0B1021',
    },
    state: {
      success: '#72F5B7',
      warning: '#FFD67E',
      error: '#FF6B88',
      info: '#73E0FF',
    },
    gradients: {
      sky: ['#0B1021', '#16213D', '#233D72'],
      aurora: ['#5DC2F2', '#FFA8F3'],
      dusk: ['#16213D', '#1C2442', '#0B1021'],
    },
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    pill: 999,
  },
  shadows: {
    pixel: {
      shadowColor: '#0A0D1C',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.75,
      shadowRadius: 0,
      elevation: 0,
    },
    soft: {
      shadowColor: '#050814',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 12,
    },
    glow: {
      shadowColor: '#5DC2F2',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 18,
      elevation: 10,
    },
  },
  motion: {
    spring: {
      gentle: {
        damping: 16,
        mass: 0.9,
        stiffness: 180,
      },
      bouncy: {
        damping: 12,
        mass: 1,
        stiffness: 240,
      },
      snappy: {
        damping: 24,
        mass: 1,
        stiffness: 320,
      },
    },
    timing: {
      quick: 120,
      default: 220,
      slow: 320,
    },
  },
  borders: {
    thin: {
      borderWidth: 1,
      borderColor: '#2E3A68',
    },
    pixel: {
      borderWidth: 2,
      borderColor: '#394372',
    },
    glow: {
      borderWidth: 2,
      borderColor: '#5DC2F2',
    },
  },
  grid: {
    unit: 8,
    gutter: 16,
    margin: 16,
  },
  typography: {
    fontFamily: {
      regular: 'Dongle-Regular',
      medium: 'Dongle-Regular',
      bold: 'Dongle-Bold',
      light: 'Dongle-Light',
      pixel: 'Dongle-Bold',
    },
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
  },
  opacity: {
    hover: 0.86,
    pressed: 0.72,
    disabled: 0.48,
  },
  zIndex: {
    background: 0,
    content: 10,
    overlay: 20,
    modal: 30,
    toast: 40,
  },
} as const;

export type AppTheme = typeof tokens;
export default tokens;
