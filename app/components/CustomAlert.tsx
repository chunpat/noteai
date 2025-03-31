import React, { useContext } from 'react';
import { Portal, Dialog, Button } from 'react-native-paper';
import { AlertContext } from '../utils/alert';

const CustomAlert = () => {
  const { alertState, hideAlert } = useContext(AlertContext);
  const { visible, title, message, confirmText, onConfirm } = alertState;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    hideAlert();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideAlert}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Dialog.ScrollArea>{message}</Dialog.ScrollArea>
        </Dialog.Content>
        <Dialog.Actions>
          {onConfirm ? (
            <>
              <Button onPress={hideAlert}>取消</Button>
              <Button onPress={handleConfirm}>{confirmText || '确定'}</Button>
            </>
          ) : (
            <Button onPress={hideAlert}>确定</Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CustomAlert;
