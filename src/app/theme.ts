import { theme, type ThemeConfig } from 'antd'

export const appTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#b42318',
    colorInfo: '#175cd3',
    colorSuccess: '#067647',
    colorWarning: '#b54708',
    borderRadius: 8,
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      bodyBg: '#f5f5f4',
      siderBg: '#1c1917',
      triggerBg: '#292524',
    },
    Menu: {
      darkItemBg: '#1c1917',
      darkSubMenuItemBg: '#141210',
      darkItemSelectedBg: '#b42318',
      darkItemHoverBg: '#292524',
    },
  },
}
