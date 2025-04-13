import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import userReducer from './userSlice';
import chatReducer from './chatSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    user: userReducer,
    chat: chatReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
