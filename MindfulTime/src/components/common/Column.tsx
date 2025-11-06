import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface ColumnProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
}

/**
 * Column component pentru layout flexbox vertical
 */
export const Column: React.FC<ColumnProps> = ({
  children,
  style,
  spacing = 0,
  align = 'stretch',
  justify = 'flex-start',
}) => {
  const columnStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: align,
    justifyContent: justify,
    gap: spacing,
  };

  return <View style={[columnStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({});
