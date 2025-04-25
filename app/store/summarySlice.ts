import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionsAPI } from '../services/api';

interface SummaryState {
  total_income: string;
  total_expense: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SummaryState = {
  total_income: '0',
  total_expense: '0',
  status: 'idle',
  error: null,
};

export const fetchSummary = createAsyncThunk(
  'summary/fetchSummary',
  async () => {
    const response = await transactionsAPI.getSummary();
    return response.data;
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.total_income = action.payload.total_income;
        state.total_expense = action.payload.total_expense;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch summary';
      });
  },
});

export default summarySlice.reducer;
