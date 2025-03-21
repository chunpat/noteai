import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    secondary: '#5AC8FA',
    tertiary: '#FF2D55',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#5AC8FA',
    text: '#000000',
    placeholder: '#8E8E93',
    disabled: '#C7C7CC',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
}; 