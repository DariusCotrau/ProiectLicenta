import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { Text } from './Text';
import { Row } from './Row';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Chip component pentru tag-uri și categorii
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  selected = false,
  icon,
  color,
  style,
  disabled = false,
}) => {
  const chipColor = color || Theme.colors.primary;
  const backgroundColor = selected ? chipColor : chipColor + '20';
  const textColor = selected ? '#FFFFFF' : chipColor;

  const chipStyle: ViewStyle = {
    height: Theme.componentSizes.chip.height,
    backgroundColor,
    borderRadius: Theme.componentSizes.chip.height / 2,
    paddingHorizontal: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: selected ? 0 : 1,
    borderColor: chipColor + '40',
  };

  const content = (
    <Row spacing={Theme.spacing.xs} align="center">
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={textColor}
        />
      )}
      <Text
        variant="caption"
        color={textColor}
        weight="500"
        style={{ textTransform: 'none' }}
      >
        {label}
      </Text>
    </Row>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          chipStyle,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
        android_ripple={{ color: textColor + '30' }}
      >
        {content}
      </Pressable>
    );
  }

  return <Pressable style={[chipStyle, style]}>{content}</Pressable>;
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
