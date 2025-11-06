import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Theme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  centered?: boolean;
  padding?: boolean;
  paddingHorizontal?: boolean;
  paddingVertical?: boolean;
}

/**
 * Container responsive pentru layout consistent
 * Se adaptează automat la dimensiunile ecranului
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  centered = false,
  padding = true,
  paddingHorizontal = false,
  paddingVertical = false,
}) => {
  const { padding: responsivePadding } = useResponsive();

  const containerStyle: ViewStyle = {
    flex: 1,
    ...(padding && {
      paddingHorizontal: responsivePadding.horizontal,
      paddingVertical: responsivePadding.vertical,
    }),
    ...(paddingHorizontal && {
      paddingHorizontal: responsivePadding.horizontal,
    }),
    ...(paddingVertical && {
      paddingVertical: responsivePadding.vertical,
    }),
    ...(centered && {
      justifyContent: 'center',
      alignItems: 'center',
    }),
  };

  return <View style={[containerStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({});
