import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '../services/transaction';
import type { Transaction, TransactionRequest, TransactionUpdateRequest, TransactionWithCategory } from '../types/transaction';

interface TransactionsState {
  items: TransactionWithCategory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async () => {
    return await transactionService.getTransactions();
  }
);

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (transaction: TransactionRequest) => {
    return await transactionService.createTransaction(transaction);
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: string; data: TransactionUpdateRequest }) => {
    return await transactionService.updateTransaction(id, data);
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string) => {
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
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<TransactionWithCategory[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(addTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        // Find the matching category from existing transactions
        const existingCategory = state.items.find(
          item => item.category.id === action.payload.category_id
        )?.category;

        // Add the new transaction with category information
        state.items.unshift({
          ...action.payload,
          category: existingCategory || {
            id: action.payload.category_id,
            name: '未知类别',
            type: action.payload.type,
            icon: 'help-circle-outline',
            sort: 0,
            created_at: action.payload.created_at,
            updated_at: action.payload.updated_at
          }
        } as TransactionWithCategory);
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          // Keep the existing category information
          const existingCategory = state.items[index].category;
          state.items[index] = {
            ...action.payload,
            category: existingCategory
          } as TransactionWithCategory;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
