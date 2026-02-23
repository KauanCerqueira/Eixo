import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const THEME = {
  colors: {
    background: '#FEFCE8', // Cream/Yellowish light background (Paper)
    surface: '#FFFFFF',    // White
    card: '#FFFFFF',
    primary: '#000000',    // Black strokes
    primaryLight: '#DBEAFE',
    secondary: '#FDE047',  // Yellow
    accent: '#F472B6',     // Pink 400 (Playful accent)
    accent2: '#4ADE80',    // Green
    accent3: '#60A5FA',    // Blue
    text: '#0F172A',       // Slate 900
    textSecondary: '#475569', // Slate 600
    muted: '#E2E8F0',
    urgent: '#EF4444',
    error: '#EF4444',      // Red 500
    border: '#000000',     // Black stroke
    success: '#22C55E',    // Green 500
    warning: '#F59E0B',    // Amber 500
    info: '#3B82F6',       // Blue 500
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    full: 9999,
  },
  borderWidth: 3, // Thicker strokes for cartoon feel
  shadow: {
    // Hard shadow style
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  },
  typography: {
    header: {
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: -1,
    },
    subHeader: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    body: {
      fontSize: 16,
      fontWeight: '600',
    },
    caption: {
      fontSize: 14,
      fontWeight: '600',
      color: '#475569',
    },
  },
  dimensions: {
    width,
    height,
  }
};
