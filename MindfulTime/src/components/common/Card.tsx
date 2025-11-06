import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { Theme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: boolean;
  margin?: boolean;
}

/**
 * Card component responsive cu shadow consistent pe Android și iOS
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'md',
  padding = true,
  margin = true,
}) => {
  const { isSmall, isTablet } = useResponsive();

  const cardStyle: ViewStyle = {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows[elevation],
    ...(padding && {
      padding: isSmall ? Theme.spacing.sm : isTablet ? Theme.spacing.lg : Theme.spacing.md,
    }),
    ...(margin && {
      margin: isSmall ? Theme.spacing.sm : isTablet ? Theme.spacing.lg : Theme.spacing.md,
      marginVertical: Theme.spacing.sm,
    }),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
        android_ripple={{ color: Theme.colors.primary + '20' }}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
