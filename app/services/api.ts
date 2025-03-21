import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL } from '../utils/constants';

// API响应类型定义
interface ApiResponse<T = any> {
  error_code: number;
  error_msg: string;
  data: T;
}

// 错误响应类型
interface ApiError {
  message: string;
  code: number;
  data?: any;
}

// 认证响应类型
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

// 用户信息类型
interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// API实例类型
type ApiInstance = ReturnType<typeof axios.create>;

// API请求类型
type ApiRequestResult<T> = Promise<AxiosResponse<ApiResponse<T>>>;
type ApiRequest<T> = (api: ApiInstance) => ApiRequestResult<T>;

// 错误码对应的默认消息
const ERROR_MESSAGES = {
  // 系统错误
  1000: '服务器内部错误',
  1001: '请求参数错误',
  1002: '未授权或登录已过期',
  1003: '无权访问',
  1004: '资源不存在',

  // 认证错误
  2000: '验证码不存在',
  2001: '验证码已过期',
  2002: '验证码错误',
  2003: '无效的认证令牌',
  2004: '邮箱格式不正确',
  2005: '验证码格式不正确',

  // 用户错误
  3000: '用户不存在',
  3001: '用户已存在',

  // 默认错误
  '-1': '未知错误',
};

// 判断是否为静默错误
const isSilentError = (code: number): boolean => {
  return [2001, 2002].includes(code); // 验证码过期、验证码错误
};

// Loading state management
type LoadingState = {
  [key: string]: boolean;
};

const loadingState: LoadingState = {};
const loadingStateCallbacks: { [key: string]: ((loading: boolean) => void)[] } = {};

const setLoading = (key: string, loading: boolean): void => {
  loadingState[key] = loading;
  if (loadingStateCallbacks[key]) {
    loadingStateCallbacks[key].forEach(callback => callback(loading));
  }
};

export const subscribeToLoading = (key: string, callback: (loading: boolean) => void): (() => void) => {
  if (!loadingStateCallbacks[key]) {
    loadingStateCallbacks[key] = [];
  }
  loadingStateCallbacks[key].push(callback);
  return () => {
    loadingStateCallbacks[key] = loadingStateCallbacks[key].filter(cb => cb !== callback);
  };
};

export const getLoadingState = (key: string): boolean => loadingState[key] || false;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const apiResponse = response.data;
    
    if (apiResponse.error_code !== 0) {
      const errorMessage = apiResponse.error_msg || ERROR_MESSAGES[apiResponse.error_code] || '请求失败';
      
      // 特定错误码无需显示提示
      if (!isSilentError(apiResponse.error_code)) {
        Alert.alert('错误提示', errorMessage);
      }
      
      throw {
        message: errorMessage,
        code: apiResponse.error_code,
        data: apiResponse.data,
      } as ApiError;
    }
    
    return response;
  },
  async (error) => {
    let errorMessage = '请求失败';
    let errorCode = -1;
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        try {
          // 清除所有认证相关的存储数据
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          // 延迟一下再抛出错误，确保存储清除完成
          await new Promise(resolve => setTimeout(resolve, 100));
          errorMessage = '未授权或登录已过期';
          errorCode = 1002;
        } catch (e) {
          console.error('Failed to clear auth data:', e);
          // 即使清除存储失败，也继续处理401错误
          errorMessage = '未授权或登录已过期';
          errorCode = 1002;
        }
      } else if (status === 500) {
        errorMessage = '服务器内部错误，请稍后重试';
        errorCode = 1000;
      } else if (data?.error_msg) {
        errorMessage = data.error_msg || ERROR_MESSAGES[data.error_code] || '请求失败';
        errorCode = data.error_code || status;
      }
    } else if (error.request) {
      errorMessage = '网络错误，请检查网络连接';
    } else {
      errorMessage = error.message || '请求失败';
    }
    
    Alert.alert('错误提示', errorMessage);
    throw {
      message: errorMessage,
      code: errorCode
    } as ApiError;
  }
);

// Helper function to wrap API calls with loading state
export async function withLoading<T>(
  key: string, 
  apiCall: ApiRequest<T>
): Promise<T> {
  setLoading(key, true);
  try {
    const response = await apiCall(api);
    return response.data.data as T;
  } finally {
    setLoading(key, false);
  }
}

// API endpoints
export const authAPI = {
  sendCode: async (email: string): Promise<void> => {
    await withLoading<void>('sendCode', (api) => 
      api.post('/auth/send-code', { email })
    );
  },
  
  verifyCode: async (email: string, code: string): Promise<AuthResponse> => {
    const authResponse = await withLoading<AuthResponse>('verifyCode', (api) => 
      api.post('/auth/verify-code', { email, code })
    );
    
    // 成功后保存 token
    await AsyncStorage.setItem('userToken', authResponse.token);
    return authResponse;
  },
  
  logout: async (): Promise<void> => {
    try {
      await withLoading<void>('logout', (api) => 
        api.post('/auth/logout')
      );
      // 清除所有认证相关的存储数据
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    } catch (error) {
      // 即使API调用失败，也要确保清除本地存储
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      throw error;
    }
  },
  
  getProfile: async (): Promise<UserProfile> => {
    return withLoading<UserProfile>('getProfile', (api) => 
      api.get('/user/profile')
    );
  }
};

export const transactionsAPI = {
  getAll: async (): Promise<any[]> => {
    return withLoading<any[]>('getTransactions', (api) => 
      api.get('/transactions')
    );
  },
  
  getById: async (id: string): Promise<any> => {
    return withLoading<any>(`getTransaction_${id}`, (api) => 
      api.get(`/transactions/${id}`)
    );
  },
  
  create: async (data: any): Promise<any> => {
    return withLoading<any>('createTransaction', (api) => 
      api.post('/transactions', data)
    );
  },
  
  update: async (id: string, data: any): Promise<any> => {
    return withLoading<any>(`updateTransaction_${id}`, (api) => 
      api.put(`/transactions/${id}`, data)
    );
  },
  
  delete: async (id: string): Promise<void> => {
    await withLoading<void>(`deleteTransaction_${id}`, (api) => 
      api.delete(`/transactions/${id}`)
    );
  }
};

export const chatAPI = {
  sendMessage: async (message: string): Promise<any> => {
    return withLoading<any>('sendMessage', (api) => 
      api.post('/chat', { message })
    );
  },
  
  getHistory: async (): Promise<any[]> => {
    return withLoading<any[]>('getChatHistory', (api) => 
      api.get('/chat/history')
    );
  },
  
  clearHistory: async (): Promise<void> => {
    await withLoading<void>('clearChatHistory', (api) => 
      api.delete('/chat/history')
    );
  }
};

export default api;
