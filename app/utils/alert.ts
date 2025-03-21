import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const showAlert = (
  title: string,
  message: string,
  buttons: AlertButton[] = []
): void => {
  if (Platform.OS === 'web') {
    // Web 平台使用浏览器原生确认框
    if (window.confirm(`${title}\n${message}`)) {
      // 找到非 cancel 类型的按钮并执行
      const confirmButton = buttons.find(btn => btn.style !== 'cancel');
      confirmButton?.onPress?.();
    } else {
      // 找到 cancel 类型的按钮并执行
      const cancelButton = buttons.find(btn => btn.style === 'cancel');
      cancelButton?.onPress?.();
    }
  } else {
    // 原生平台使用 React Native Alert
    Alert.alert(title, message, buttons);
  }
};