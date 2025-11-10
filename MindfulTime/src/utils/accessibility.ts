import { Platform } from 'react-native';

/**
 * Accessibility utilities and constants
 */

// Minimum touch target sizes (in pixels)
export const TOUCH_TARGET = {
  MIN_SIZE: Platform.select({ ios: 44, android: 48, default: 44 }),
  RECOMMENDED_SIZE: 48,
  LARGE_SIZE: 56,
};

// WCAG 2.1 contrast ratios
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5, // WCAG AA for normal text
  LARGE_TEXT: 3, // WCAG AA for large text (18pt+ or 14pt+ bold)
  UI_COMPONENTS: 3, // WCAG AA for UI components
};

/**
 * Get accessibility label for a component
 */
export const getAccessibilityLabel = (
  label: string,
  value?: string | number,
  unit?: string
): string => {
  if (value !== undefined) {
    return `${label}: ${value}${unit ? ` ${unit}` : ''}`;
  }
  return label;
};

/**
 * Get accessibility hint for a component
 */
export const getAccessibilityHint = (action: string): string => {
  return `Tap to ${action}`;
};

/**
 * Format time for screen readers
 */
export const formatTimeForAccessibility = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hourText = hours === 1 ? 'hour' : 'hours';
    const minText = mins === 1 ? 'minute' : 'minutes';

    if (mins > 0) {
      return `${hours} ${hourText} and ${mins} ${minText}`;
    }
    return `${hours} ${hourText}`;
  }
  const minText = minutes === 1 ? 'minute' : 'minutes';
  return `${minutes} ${minText}`;
};

/**
 * Format date for screen readers
 */
export const formatDateForAccessibility = (date: Date): string => {
  return date.toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get role description for custom components
 */
export const getRoleDescription = (role: 'card' | 'metric' | 'achievement' | 'transaction'): string => {
  switch (role) {
    case 'card':
      return 'Information card';
    case 'metric':
      return 'Statistics metric';
    case 'achievement':
      return 'Achievement badge';
    case 'transaction':
      return 'Transaction item';
    default:
      return '';
  }
};

/**
 * Check if touch target size is sufficient
 */
export const isTouchTargetSufficient = (size: number): boolean => {
  return size >= TOUCH_TARGET.MIN_SIZE;
};

/**
 * Get recommended padding for touch targets
 */
export const getTouchTargetPadding = (contentSize: number): number => {
  const deficit = TOUCH_TARGET.MIN_SIZE - contentSize;
  return deficit > 0 ? Math.ceil(deficit / 2) : 0;
};

/**
 * Announce message for screen readers
 */
export const announceForAccessibility = (message: string) => {
  // This would use AccessibilityInfo.announceForAccessibility in React Native
  // For now, we'll just log it
  if (__DEV__) {
    console.log('[A11Y Announcement]:', message);
  }
};

/**
 * Semantic form labels
 */
export const FORM_LABELS = {
  EMAIL: 'Email address',
  PASSWORD: 'Password',
  CONFIRM_PASSWORD: 'Confirm password',
  NAME: 'Full name',
  SUBMIT: 'Submit form',
  CANCEL: 'Cancel',
};

/**
 * Common accessibility traits/roles
 */
export const A11Y_TRAITS = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  IMAGE: 'image',
  TEXT: 'text',
  NONE: 'none',
};

/**
 * Get state description for accessibility
 */
export const getStateDescription = (
  isLoading?: boolean,
  isDisabled?: boolean,
  isSelected?: boolean,
  isError?: boolean
): string => {
  const states: string[] = [];

  if (isLoading) states.push('loading');
  if (isDisabled) states.push('disabled');
  if (isSelected) states.push('selected');
  if (isError) states.push('error');

  return states.length > 0 ? states.join(', ') : '';
};
