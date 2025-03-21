import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

export const verifyCode = createAsyncThunk(
  'user/verifyCode',
  async ({ email, code }: { email: string; code: string }) => {
    const response = await authAPI.verifyCode(email, code);
    
    const { token, user } = response.data;
    
    // Store token in secure storage
    await SecureStore.setItemAsync('userToken', token);
    
    return { token, user };
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  await SecureStore.deleteItemAsync('userToken');
  return null;
});

export const loadUserProfile = createAsyncThunk('user/loadProfile', async () => {
  const token = await SecureStore.getItemAsync('userToken');
  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await authAPI.getProfile();
  return { token, user: response.data };
});

export const sendCode = createAsyncThunk(
  'user/sendCode',
  async (email: string) => {
    const response = await authAPI.sendCode(email);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(verifyCode.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Verification failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(loadUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loadUserProfile.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
      });
  },
});

export default userSlice.reducer;
