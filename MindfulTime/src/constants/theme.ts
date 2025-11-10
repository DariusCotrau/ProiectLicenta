import { Platform } from 'react-native';
import { colors } from './colors';

/**
 * Theme configuration pentru design consistent cross-platform
 * Funcționează identic pe Android și iOS
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

export const Typography = {
  // Heading styles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.15,
  },

  // Body styles
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },

  // Label styles
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 1.25,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 2.5,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4.0,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 8.0,
    elevation: 12,
  },
} as const;

export const Layout = {
  // Container widths for responsive design
  maxWidth: {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
  },

  // Breakpoints for responsive behavior
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },

  // Screen padding
  screenPadding: {
    horizontal: Spacing.md,
    vertical: Spacing.md,
  },

  // Card defaults
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
  },
} as const;

export const Transitions = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
} as const;

/**
 * Platform-specific adjustments
 */
export const PlatformUtils = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',

  // Status bar height (use SafeAreaView for proper handling)
  statusBarHeight: Platform.select({
    ios: 44,
    android: 0,
  }),

  // Navigation bar height
  navBarHeight: Platform.select({
    ios: 44,
    android: 56,
  }),

  // Tab bar height
  tabBarHeight: Platform.select({
    ios: 49,
    android: 60,
  }),

  // Elevation vs shadow
  getShadow: (elevation: number) => {
    if (Platform.OS === 'android') {
      return { elevation };
    }

    // iOS shadow mapping based on elevation
    const shadowOpacity = Math.min(elevation * 0.02, 0.3);
    const shadowRadius = Math.min(elevation * 0.5, 10);
    const shadowOffset = {
      width: 0,
      height: Math.min(elevation * 0.25, 8)
    };

    return {
      shadowColor: '#000',
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    };
  },
} as const;

/**
 * Iconography standards
 */
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const;

/**
 * Component-specific dimensions
 */
export const ComponentSizes = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    minWidth: 64,
  },
  input: {
    height: {
      sm: 36,
      md: 48,
      lg: 56,
    },
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  chip: {
    height: 32,
  },
} as const;

/**
 * Complete theme object
 */
export const Theme = {
  colors: colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  layout: Layout,
  transitions: Transitions,
  platform: PlatformUtils,
  iconSizes: IconSizes,
  componentSizes: ComponentSizes,
} as const;

export type ThemeType = typeof Theme;
