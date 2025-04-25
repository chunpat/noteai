import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '../services/transaction';
import type { Transaction, TransactionRequest, TransactionUpdateRequest, TransactionWithCategory } from '../types/transaction';
import type { RootState } from './index';

interface TransactionsState {
  items: TransactionWithCategory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  hasMore: boolean;
}

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20
  },
  hasMore: true
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async ({ page = 1, perPage = 20, refresh = false, type = 'all' }: { 
    page?: number; 
    perPage?: number; 
    refresh?: boolean;
    type?: 'all' | 'income' | 'expense';
  }, { getState }) => {
    const state = getState() as RootState;
    if (!refresh && !state.transactions.hasMore) {
      return { transactions: [], pagination: state.transactions.pagination };
    }
    return await transactionService.getTransactions(page, perPage, type !== 'all' ? type : undefined);
  }
);

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (transaction: TransactionRequest, thunkAPI): Promise<TransactionWithCategory> => {
    const response = await transactionService.createTransaction(transaction);
    // Find matching category from existing transactions to include in response
    const existingCategory = (thunkAPI.getState() as RootState).transactions.items.find(
      item => item.category.id === response.category_id
    )?.category;
    return {
      ...response,
      category: existingCategory || {
        id: response.category_id,
        name: '',
        type: 'expense',
        user_id: 0,
        sort: 0,
        icon: 'help-circle-outline',
        created_at: response.created_at,
        updated_at: response.updated_at
      }
    };
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: number; data: TransactionUpdateRequest }, thunkAPI): Promise<TransactionWithCategory> => {
    const response = await transactionService.updateTransaction(id, data);
    // Keep the existing category when updating
    const existingTransaction = (thunkAPI.getState() as RootState).transactions.items.find(item => item.id === id);
    return {
      ...response,
      category: existingTransaction?.category || {
        id: response.category_id,
        name: '',
        type: 'expense',
        user_id: 0,
        sort: 0,
        icon: 'help-circle-outline',
        created_at: response.created_at,
        updated_at: response.updated_at
      }
    };
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number) => {
    await transactionService.deleteTransaction(id);
    return id;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { transactions, pagination } = action.payload;
        if (pagination.currentPage === 1) {
          state.items = transactions;
        } else {
          state.items = [...state.items, ...transactions];
        }
        state.pagination = pagination;
        state.hasMore = pagination.currentPage < pagination.lastPage;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(addTransaction.fulfilled, (state, action: PayloadAction<TransactionWithCategory>) => {
        // Add the new transaction at the beginning of the list
        state.items.unshift(action.payload);
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<TransactionWithCategory>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
