import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import chatReducer from './chatSlice';
import categoryReducer from './categorySlice';
import userReducer from './userSlice';
import summaryReducer from './summarySlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    chat: chatReducer,
    categories: categoryReducer,
    user: userReducer,
    summary: summaryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
