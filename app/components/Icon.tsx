import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { IonIconName } from '../types/category';

interface Props {
  name: IonIconName;
  size?: number;
  color?: string;
}

const Icon = ({ name, size = 24, color }: Props) => {
  return <Ionicons name={name} size={size} color={color} />;
};

export default Icon;
