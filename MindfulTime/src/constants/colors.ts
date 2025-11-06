// Color palette for the app
export const colors = {
  primary: '#6200EE',
  primaryDark: '#3700B3',
  primaryLight: '#BB86FC',

  secondary: '#03DAC6',
  secondaryDark: '#018786',

  background: '#FFFFFF',
  backgroundDark: '#121212',

  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',

  error: '#B00020',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',

  text: '#000000',
  textLight: '#FFFFFF',
  textSecondary: '#757575',

  // App status colors
  blocked: '#F44336',
  active: '#4CAF50',
  warning: '#FFC107',

  // Task category colors
  outdoor: '#4CAF50',
  reading: '#2196F3',
  exercise: '#FF5722',
  meditation: '#9C27B0',
  creative: '#FF9800',
  social: '#00BCD4',
  custom: '#607D8B',
};

export const theme = {
  light: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textSecondary,
  },
  dark: {
    primary: colors.primaryLight,
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: colors.textLight,
    textSecondary: colors.textSecondary,
  },
};
