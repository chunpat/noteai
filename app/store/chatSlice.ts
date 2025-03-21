import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../utils/constants';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  transactionData?: {
    amount: number;
    category: string;
    description: string;
    date: string;
    type: 'income' | 'expense';
  } | null;
}

interface ChatState {
  messages: Message[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  status: 'idle',
  error: null,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (content: string, { getState }) => {
    // First add the user message to the state
    const userMessage: Omit<Message, 'id'> = {
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      transactionData: null,
    };
    
    // Send the message to the API
    const response = await axios.post(`${API_URL}/api/v1/chat`, {
      message: content,
    });
    
    // Extract the AI response and any transaction data
    const { message, transactionData } = response.data.data;
    
    // Create the AI response message
    const aiMessage: Omit<Message, 'id'> = {
      content: message,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      transactionData: transactionData || null,
    };
    
    // Return both messages to be added to the state
    return {
      userMessage: { ...userMessage, id: Date.now().toString() + '-user' },
      aiMessage: { ...aiMessage, id: Date.now().toString() + '-ai' },
    };
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async () => {
    const response = await axios.get(`${API_URL}/api/v1/chat/history`);
    return response.data.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChat: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.aiMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to send message';
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChatHistory.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch chat history';
      });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer; 