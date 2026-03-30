import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    // Primary colors - Medical Blue
    colorPrimary: '#1E5F8A',
    colorSuccess: '#2E7D5A',
    colorWarning: '#B8760A',
    colorError: '#C23B3B',
    colorInfo: '#1E5F8A',

    // Typography
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // Border radius
    borderRadius: 6,

    // Line heights
    lineHeight: 1.5714,
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 8,
    },
    Table: {
      borderRadius: 8,
    },
    Menu: {
      itemBorderRadius: 6,
    },
  },
};
