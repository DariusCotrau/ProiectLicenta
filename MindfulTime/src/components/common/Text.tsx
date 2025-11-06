import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Theme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'button' | 'caption' | 'overline';
  color?: string;
  style?: StyleProp<TextStyle>;
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
}

/**
 * Text component cu typography responsive
 * Font sizes se adaptează automat la dimensiunile ecranului
 */
export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  color = Theme.colors.text,
  style,
  align = 'left',
  numberOfLines,
  weight,
}) => {
  const { getFontSize, isSmall, isTablet } = useResponsive();

  const typographyStyle = Theme.typography[variant];

  const textStyle: TextStyle = {
    ...typographyStyle,
    fontSize: getFontSize(typographyStyle.fontSize),
    color,
    textAlign: align,
    ...(weight && { fontWeight: weight }),
  };

  return (
    <RNText
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      allowFontScaling={false} // Pentru control consistent al dimensiunii
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({});
