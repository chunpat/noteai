import type { IonIconName } from './category';

export interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionRequest = {
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note?: string;
};

export type TransactionUpdateRequest = Partial<TransactionRequest>;

export type TransactionWithCategory = Transaction & {
  category: {
    id: string;
    name: string;
    icon: IonIconName;
  };
};
