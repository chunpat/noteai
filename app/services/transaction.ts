import { transactionsAPI } from './api';
import type { Transaction, TransactionRequest, TransactionUpdateRequest, TransactionWithCategory } from '../types/transaction';

interface ListApiResponse<T> {
  error_code: number;
  error_msg: string;
  data: {
    data: T[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

interface SingleApiResponse<T> {
  error_code: number;
  error_msg: string;
  data: T;
}

class TransactionService {
  async getTransactions(): Promise<TransactionWithCategory[]> {
    try {
      console.log('Fetching transactions...');
      const response = await transactionsAPI.getAll() as ListApiResponse<TransactionWithCategory>;
      console.log('Raw API response:', response);

      if (response.error_code !== 0) {
        throw new Error(response.error_msg || '获取交易记录失败');
      }

      // Extract transactions from nested data structure
      const transactions = response?.data?.data || [];
      return transactions.map((transaction: any) => ({
        ...transaction,
        amount: transaction.amount?.toString() || '0',
        transaction_date: transaction.transaction_date || transaction.created_at,
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createTransaction(data: TransactionRequest): Promise<TransactionWithCategory> {
    try {
      console.log('Creating transaction with data:', data);
      const newTransaction = {
        ...data,
        // Convert number to string for API
        amount: data.amount.toString(),
      };
      
      // 验证必填字段
      if (!newTransaction.category_id || !newTransaction.amount || !newTransaction.transaction_date) {
        throw new Error('请完整填写必要信息');
      }
      
      const response = await transactionsAPI.create(newTransaction) as SingleApiResponse<TransactionWithCategory>;
      console.log('Created transaction response:', response);
      
      if (response.error_code === 40000) {
        throw new Error(response.error_msg || '请完整填写必要信息');
      }
      
      if (response.error_code !== 0) {
        throw new Error(response.error_msg || '创建交易记录失败');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: number, data: TransactionUpdateRequest): Promise<TransactionWithCategory> {
    try {
      console.log(`Updating transaction ${id} with data:`, data);
      const updateData = {
        ...data,
        // Convert amount to string if present
        amount: data.amount?.toString(),
      };

      const response = await transactionsAPI.update(id.toString(), updateData) as SingleApiResponse<TransactionWithCategory>;
      console.log('Updated transaction response:', response);

      if (response.error_code === 40000) {
        throw new Error(response.error_msg || '请完整填写必要信息');
      }

      if (response.error_code !== 0) {
        throw new Error(response.error_msg || '更新交易记录失败');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      console.log(`Deleting transaction ${id}`);
      const response = await transactionsAPI.delete(id.toString());
      
      if (response.error_code !== 0) {
        throw new Error(response.error_msg || '删除交易记录失败');
      }
      
      console.log('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;
