import { transactionsAPI } from './api';
import type { Transaction, TransactionRequest, TransactionUpdateRequest, TransactionWithCategory } from '../types/transaction';
import { alert } from '../utils/alert';

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
  async getTransactions(page: number = 1, perPage: number = 20, type?: string): Promise<{ 
    transactions: TransactionWithCategory[],
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
      perPage: number;
    }
  }> {
    try {
      console.log('Fetching transactions...', { page, perPage });
      const response = await transactionsAPI.getAll({ 
        page: page.toString(),
        per_page: perPage.toString(),
        ...(type && { type })
      }) as ListApiResponse<TransactionWithCategory>;
      console.log('Raw API response:', response);


      // Extract transactions from nested data structure
      // 设置默认值，避免undefined错误
      const defaultPagination = {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: perPage
      };

      const transactions = response?.data || [];
      const pagination = response?.pagination || defaultPagination;

      const mappedTransactions = transactions.map((transaction: any) => ({
        ...transaction,
        amount: transaction.amount?.toString() || '0',
        transaction_date: transaction.transaction_date || transaction.created_at,
      }));

      return {
        transactions: mappedTransactions,
        pagination: {
          currentPage: pagination.current_page,
          lastPage: pagination.last_page,
          total: pagination.total,
          perPage: pagination.per_page
        }
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert.show('错误', '获取交易记录失败');
      return {
        transactions: [],
        pagination: {
          currentPage: 1,
          lastPage: 1,
          total: 0,
          perPage: 20
        }
      };
    }
  }

  async createTransaction(data: TransactionRequest): Promise<TransactionWithCategory> {
    try {
      console.log('Creating transaction with data:', data);
      const newTransaction = {
        category_id: data.category_id,
        amount: data.amount.toString(),
        transaction_date: data.transaction_date,
        note: data.note
      };
      
      console.log('New transaction data:', newTransaction);
      // 验证必填字段
      if (!newTransaction.category_id || !newTransaction.amount || !newTransaction.transaction_date) {
        alert.show('错误', '请完整填写必要信息');
        return null as unknown as TransactionWithCategory;
      }
      
      const response = await transactionsAPI.create(newTransaction);
      console.log('Created transaction response:', response);
      
      return response;
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert.show('错误', '创建交易记录失败');
      return null as unknown as TransactionWithCategory;
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
        alert.show('错误', response.error_msg || '请完整填写必要信息');
        return null as unknown as TransactionWithCategory;
      }

      if (response.error_code !== 0) {
        alert.show('错误', response.error_msg || '更新交易记录失败');
        return null as unknown as TransactionWithCategory;
      }

      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert.show('错误', '更新交易记录失败');
      return null as unknown as TransactionWithCategory;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      console.log(`Deleting transaction ${id}`);
      const response = await transactionsAPI.delete(id.toString());
      
      if (response.error_code !== 0) {
        alert.show('错误', response.error_msg || '删除交易记录失败');
        return;
      }
      
      console.log('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert.show('错误', '删除交易记录失败');
      return;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;
