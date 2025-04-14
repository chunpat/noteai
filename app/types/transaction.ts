import type { IonIconName } from './category';

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  note?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export type TransactionRequest = {
  category_id: number;
  amount: number;
  transaction_date: string;
  note?: string;
};

export type TransactionUpdateRequest = Partial<TransactionRequest>;

export type TransactionWithCategory = Transaction & {
  category: {
    id: number;
    name: string;
    type: 'income' | 'expense';
    user_id: number;
    sort: number;
    icon: IonIconName;
    created_at: string;
    updated_at: string;
  };
};
