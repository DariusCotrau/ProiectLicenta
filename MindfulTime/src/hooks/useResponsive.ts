import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  getScreenDimensions,
  getResponsivePadding,
  getResponsiveFontSize,
  getResponsiveIconSize,
  isPortrait,
  isLandscape,
} from '../utils/responsive';

/**
 * Hook pentru gestionarea responsive design în componente
 * Se actualizează automat la schimbarea orientării sau dimensiunilor
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(getScreenDimensions());
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    isPortrait() ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
      setOrientation(window.height >= window.width ? 'portrait' : 'landscape');
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmall: isSmallDevice(),
    isMedium: isMediumDevice(),
    isLarge: isLargeDevice(),
    isTablet: isTablet(),
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    orientation,
    padding: getResponsivePadding(),
    getFontSize: getResponsiveFontSize,
    getIconSize: getResponsiveIconSize,
  };
};

/**
 * Hook pentru breakpoints responsive
 */
export const useBreakpoint = () => {
  const { width } = useResponsive();

  const getBreakpoint = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
    if (width < 375) return 'xs';
    if (width < 576) return 'sm';
    if (width < 768) return 'md';
    if (width < 992) return 'lg';
    return 'xl';
  };

  return {
    breakpoint: getBreakpoint(),
    isXs: width < 375,
    isSm: width >= 375 && width < 576,
    isMd: width >= 576 && width < 768,
    isLg: width >= 768 && width < 992,
    isXl: width >= 992,
  };
};

/**
 * Hook pentru orientare
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    isPortrait() ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setOrientation(window.height >= window.width ? 'portrait' : 'landscape');
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};
