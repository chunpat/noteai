import api from './api';
import type { Transaction, TransactionRequest, TransactionUpdateRequest, TransactionWithCategory } from '../types/transaction';

class TransactionService {
  async getTransactions(): Promise<TransactionWithCategory[]> {
    const response = await api.get('/transactions');
    return response.data.data;
  }

  async createTransaction(data: TransactionRequest): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    return response.data.data;
  }

  async updateTransaction(id: string, data: TransactionUpdateRequest): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }
}

export const transactionService = new TransactionService();
export default transactionService;
