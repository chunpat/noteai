import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal, Text, Button } from 'react-native-paper';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onDismiss,
  onConfirm,
  confirmText = '确定'
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Button
          mode="contained"
          onPress={() => {
            onDismiss();
            onConfirm?.();
          }}
          style={styles.button}
        >
          {confirmText}
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 40,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
  }
});

export default CustomAlert;
