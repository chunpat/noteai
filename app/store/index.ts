import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import userReducer from './userSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    user: userReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 