export const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#27ae60',
      background: '#f0f0f0',
      card: '#ffffff',
      text: '#1F2937',
      subtext: '#6B7280',
      border: '#E5E7EB',
      success: '#27ae60',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#4ade80',
      background: '#111827',
      card: '#1F2937',
      text: '#F9FAFB',
      subtext: '#9CA3AF',
      border: '#374151',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
    },
  },
};

export const getSystemTheme = () => {
  // This would normally check the system theme
  // For now, return light as default
  return 'light';
};
