import React from 'react';
import { View } from 'react-native';
import { Theme } from '../../constants/theme';

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  horizontal?: boolean;
  custom?: number;
}

/**
 * Spacer component pentru spacing consistent
 */
export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  horizontal = false,
  custom,
}) => {
  const space = custom || Theme.spacing[size];

  return (
    <View
      style={
        horizontal
          ? { width: space }
          : { height: space }
      }
    />
  );
};
