import { transactionsAPI } from './api';
import type { Transaction, TransactionRequest, TransactionUpdateRequest, TransactionWithCategory } from '../types/transaction';

class TransactionService {
  async getTransactions(): Promise<TransactionWithCategory[]> {
    try {
      console.log('Fetching transactions...');
      const transactions = await transactionsAPI.getAll();
      console.log('Fetched transactions:', transactions);
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createTransaction(data: TransactionRequest): Promise<Transaction> {
    try {
      console.log('Creating transaction with data:', data);
      const transaction = await transactionsAPI.create(data);
      console.log('Created transaction:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: number, data: TransactionUpdateRequest): Promise<Transaction> {
    try {
      console.log(`Updating transaction ${id} with data:`, data);
      const transaction = await transactionsAPI.update(id.toString(), data);
      console.log('Updated transaction:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      console.log(`Deleting transaction ${id}`);
      await transactionsAPI.delete(id.toString());
      console.log('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;
