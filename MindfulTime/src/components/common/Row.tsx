import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface RowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
}

/**
 * Row component pentru layout flexbox orizontal
 */
export const Row: React.FC<RowProps> = ({
  children,
  style,
  spacing = 0,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
}) => {
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: align,
    justifyContent: justify,
    gap: spacing,
    ...(wrap && { flexWrap: 'wrap' }),
  };

  return <View style={[rowStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({});
