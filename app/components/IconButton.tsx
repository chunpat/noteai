import React from 'react';
import { IconButton as PaperIconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { IonIconName } from '../types/category';

interface Props {
  icon: IonIconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
}

const IconButton = ({ icon, ...rest }: Props) => {
  return (
    <PaperIconButton
      icon={({ size, color }) => (
        <Ionicons name={icon} size={size} color={color} />
      )}
      {...rest}
    />
  );
};

export default IconButton;
