import { Dimensions, Platform, PixelRatio } from 'react-native';

/**
 * Utility functions pentru design responsive cross-platform
 * Funcționează identic pe Android și iOS
 */

// Obține dimensiunile ecranului
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Obține dimensiunile safe pentru conținut
export const getScreenSafeArea = () => {
  const { width, height } = Dimensions.get('screen');
  return { width, height };
};

/**
 * Calculează dimensiunea relativă la lățimea ecranului
 * @param widthPercent - Procentul din lățimea ecranului (0-100)
 */
export const wp = (widthPercent: number): number => {
  const { width } = getScreenDimensions();
  return PixelRatio.roundToNearestPixel((width * widthPercent) / 100);
};

/**
 * Calculează dimensiunea relativă la înălțimea ecranului
 * @param heightPercent - Procentul din înălțimea ecranului (0-100)
 */
export const hp = (heightPercent: number): number => {
  const { height } = getScreenDimensions();
  return PixelRatio.roundToNearestPixel((height * heightPercent) / 100);
};

/**
 * Scalare bazată pe lățimea ecranului (design de referință: 375px - iPhone 11)
 * @param size - Dimensiunea din design-ul de referință
 */
export const scale = (size: number): number => {
  const { width } = getScreenDimensions();
  const guidelineBaseWidth = 375;
  return PixelRatio.roundToNearestPixel((width / guidelineBaseWidth) * size);
};

/**
 * Scalare verticală bazată pe înălțimea ecranului (design de referință: 812px)
 * @param size - Dimensiunea din design-ul de referință
 */
export const verticalScale = (size: number): number => {
  const { height } = getScreenDimensions();
  const guidelineBaseHeight = 812;
  return PixelRatio.roundToNearestPixel((height / guidelineBaseHeight) * size);
};

/**
 * Scalare moderată pentru font-uri și spacing
 * @param size - Dimensiunea din design
 * @param factor - Factor de moderare (0-1), default 0.5
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scaledSize = scale(size);
  return PixelRatio.roundToNearestPixel(size + (scaledSize - size) * factor);
};

/**
 * Verifică dimensiunea ecranului
 */
export const isSmallDevice = (): boolean => {
  const { width } = getScreenDimensions();
  return width < 375;
};

export const isMediumDevice = (): boolean => {
  const { width } = getScreenDimensions();
  return width >= 375 && width < 768;
};

export const isLargeDevice = (): boolean => {
  const { width } = getScreenDimensions();
  return width >= 768;
};

export const isTablet = (): boolean => {
  const { width, height } = getScreenDimensions();
  const aspectRatio = height / width;
  return Math.min(width, height) >= 600 && (aspectRatio < 1.6 || aspectRatio > 1.8);
};

/**
 * Obține padding-ul potrivit pentru dispozitiv
 */
export const getResponsivePadding = () => {
  if (isSmallDevice()) {
    return {
      horizontal: 12,
      vertical: 12,
    };
  } else if (isTablet()) {
    return {
      horizontal: 24,
      vertical: 24,
    };
  }
  return {
    horizontal: 16,
    vertical: 16,
  };
};

/**
 * Obține font size responsive
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  if (isSmallDevice()) {
    return moderateScale(baseSize * 0.9);
  } else if (isTablet()) {
    return moderateScale(baseSize * 1.1);
  }
  return moderateScale(baseSize);
};

/**
 * Obține icon size responsive
 */
export const getResponsiveIconSize = (baseSize: number): number => {
  if (isSmallDevice()) {
    return baseSize * 0.85;
  } else if (isTablet()) {
    return baseSize * 1.2;
  }
  return baseSize;
};

/**
 * Device info
 */
export const DeviceInfo = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isSmall: isSmallDevice(),
  isMedium: isMediumDevice(),
  isLarge: isLargeDevice(),
  isTablet: isTablet(),
  dimensions: getScreenDimensions(),
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

/**
 * Responsive grid system
 */
export const getGridColumns = (): number => {
  if (isSmallDevice()) return 2;
  if (isTablet()) return 4;
  return 3;
};

export const getGridItemWidth = (columns?: number): number => {
  const cols = columns || getGridColumns();
  const { width } = getScreenDimensions();
  const padding = getResponsivePadding().horizontal;
  const spacing = 8;

  return (width - padding * 2 - spacing * (cols - 1)) / cols;
};

/**
 * Orientation helpers
 */
export const isPortrait = (): boolean => {
  const { width, height } = getScreenDimensions();
  return height >= width;
};

export const isLandscape = (): boolean => {
  return !isPortrait();
};
