import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

interface IconButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * IconButton responsive pentru acțiuni rapide
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size,
  color = Theme.colors.primary,
  backgroundColor = 'transparent',
  style,
  disabled = false,
}) => {
  const { getIconSize } = useResponsive();
  const iconSize = size || getIconSize(Theme.iconSizes.md);

  const buttonStyle: ViewStyle = {
    width: iconSize + Theme.spacing.md,
    height: iconSize + Theme.spacing.md,
    borderRadius: (iconSize + Theme.spacing.md) / 2,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      android_ripple={{ color: color + '30', borderless: true }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={iconSize}
        color={disabled ? Theme.colors.disabled : color}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
