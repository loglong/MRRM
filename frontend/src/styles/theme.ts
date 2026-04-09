import type { ThemeConfig } from 'antd';

// Apple Design System Colors
const APPLE_BLUE = '#0071e3';
const APPLE_LIGHT_BG = '#f5f5f7';
const APPLE_NEAR_BLACK = '#1d1d1f';
const APPLE_TEXT_SECONDARY = 'rgba(0, 0, 0, 0.65)';
const APPLE_SUCCESS = '#34c759';
const APPLE_WARNING = '#ff9500';
const APPLE_ERROR = '#ff3b30';

export const theme: ThemeConfig = {
  token: {
    // Primary - Apple Blue (single chromatic accent)
    colorPrimary: APPLE_BLUE,
    colorSuccess: APPLE_SUCCESS,
    colorWarning: APPLE_WARNING,
    colorError: APPLE_ERROR,
    colorInfo: APPLE_BLUE,
    colorTextBase: APPLE_NEAR_BLACK,
    colorBgBase: '#ffffff',
    colorBgLayout: APPLE_LIGHT_BG,

    // Typography - SF Pro optimized
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: 17, // Apple body size
    fontSizeHeading1: 56,
    fontSizeHeading2: 40,
    fontSizeHeading3: 28,
    fontSizeHeading4: 21,
    fontSizeHeading5: 17,

    // Border radius - Apple scale
    borderRadius: 8, // Standard
    borderRadiusLG: 12,
    borderRadiusSM: 5,
    borderRadiusXS: 4,

    // Line heights - tight for headlines, relaxed for body
    lineHeight: 1.47, // Body
    lineHeightHeading1: 1.07,
    lineHeightHeading2: 1.1,
    lineHeightHeading3: 1.14,
    lineHeightHeading4: 1.19,
    lineHeightHeading5: 1.24,
  },
  components: {
    Button: {
      borderRadius: 8,
      paddingContentHorizontal: 15,
      paddingContentVertical: 8,
      fontSize: 17,
      fontWeight: 400,
      primaryShadow: 'none',
    },
    Card: {
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      paddingLG: 24,
    },
    Table: {
      borderRadius: 8,
      headerBorderRadius: 0,
    },
    Menu: {
      itemBorderRadius: 6,
      itemColor: 'rgba(0, 0, 0, 0.65)',
      itemHoverColor: APPLE_NEAR_BLACK,
      itemSelectedColor: APPLE_BLUE,
      itemSelectedBg: `${APPLE_BLUE}12`,
      horizontalItemHoverBg: 'transparent',
      horizontalItemSelectedBg: 'transparent',
    },
    Layout: {
      headerBg: 'rgba(0, 0, 0, 0.8)',
      siderBg: '#ffffff',
      bodyBg: APPLE_LIGHT_BG,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Drawer: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 980, // Pill shape
    },
    Badge: {
      borderRadiusSM: 980,
    },
  },
};

// CSS variables for use in custom components
export const appleColors = {
  blue: APPLE_BLUE,
  blueHover: '#0077ed',
  lightBg: APPLE_LIGHT_BG,
  nearBlack: APPLE_NEAR_BLACK,
  textSecondary: APPLE_TEXT_SECONDARY,
  textTertiary: 'rgba(0, 0, 0, 0.48)',
  success: APPLE_SUCCESS,
  warning: APPLE_WARNING,
  error: APPLE_ERROR,
  white: '#ffffff',
  black: '#000000',
  darkSurface1: '#272729',
  darkSurface2: '#262628',
  darkSurface3: '#28282a',
  overlay: 'rgba(210, 210, 215, 0.64)',
};
