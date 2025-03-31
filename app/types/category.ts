import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IonIconName = ComponentProps<typeof Ionicons>['name'];

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: IonIconName;
  sort: number;
  created_at: string;
  updated_at: string;
}

export type CategoryRequest = {
  name: string;
  type: 'income' | 'expense';
  icon: IonIconName;
  sort?: number;
};

export type CategoryUpdateRequest = Partial<CategoryRequest>;
