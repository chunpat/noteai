import { createContext } from 'react';

export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export interface AlertContextType {
  alertState: AlertState;
  showAlert: (options: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
  }) => void;
  hideAlert: () => void;
}

const initialState: AlertState = {
  visible: false,
  title: '',
  message: '',
};

export const AlertContext = createContext<AlertContextType>({
  alertState: initialState,
  showAlert: () => {},
  hideAlert: () => {},
});

// Global alert helper
export const alert = {
  show: (title: string, message: string) => {
    if (globalThis.showAlert) {
      globalThis.showAlert({ title, message });
    }
  },
  confirm: (title: string, message: string, onConfirm: () => void) => {
    if (globalThis.showAlert) {
      globalThis.showAlert({
        title,
        message,
        confirmText: '确定',
        onConfirm,
      });
    }
  },
};

declare global {
  var showAlert: ((options: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
  }) => void) | undefined;
}
