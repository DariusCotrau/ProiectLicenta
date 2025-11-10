import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  View,
  AccessibilityState,
  AccessibilityRole,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

/**
 * Button component responsive cu suport pentru icon și loading state
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
}) => {
  const { getIconSize, isSmall } = useResponsive();

  const buttonHeight = Theme.componentSizes.button.height[size];
  const iconSize = getIconSize(size === 'sm' ? 16 : size === 'lg' ? 24 : 20);
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: buttonHeight,
      borderRadius: Theme.borderRadius.md,
      paddingHorizontal: isSmall ? Theme.spacing.md : Theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: fullWidth ? undefined : Theme.componentSizes.button.minWidth,
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? Theme.colors.disabled : Theme.colors.primary,
          ...Theme.shadows.sm,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? Theme.colors.disabled : Theme.colors.secondary,
          ...Theme.shadows.sm,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? Theme.colors.disabled : Theme.colors.primary,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          paddingHorizontal: Theme.spacing.sm,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return Theme.colors.textSecondary;
    if (variant === 'outlined' || variant === 'text') return Theme.colors.primary;
    return '#FFFFFF';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && !disabled && styles.pressed,
        style,
      ]}
      android_ripple={{
        color: variant === 'text' || variant === 'outlined'
          ? Theme.colors.primary + '20'
          : '#FFFFFF40',
      }}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
        ...accessibilityState,
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={iconSize}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}
          <Text
            variant="button"
            color={getTextColor()}
            style={{ fontSize, textTransform: 'none' }}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={iconSize}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Theme.spacing.xs,
  },
  iconRight: {
    marginLeft: Theme.spacing.xs,
  },
});
