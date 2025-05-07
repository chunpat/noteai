import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { STORAGE_KEYS } from './auth';
import { API_URL } from '../utils/constants';
import type { TransactionWithCategory } from '../types/transaction';

// Use browser alert for web, React Native Alert for mobile
const showAlert = (title: string, message: string) => {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${title}\n${message}`);
  }
};

// API响应类型定义
interface ApiResponse<T = any> {
  error_code: number;
  error_msg: string;
  data: T;
}

// 错误响应类型
export interface ApiError {
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
    avatar?: string | null;
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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Helper function to wrap API calls with loading state and data validation
export async function withLoading<T>(
  key: string,
  apiCall: ApiRequest<T>,
  validate?: ValidateFunction<T>
): Promise<T> {
  setLoading(key, true);
  try {
    const apiResponse = await apiCall(api);
    const response = apiResponse.data;
    
    // Handle 401 error
    if (response.error_code === 401) {
      await authService.clearAuthData();
      throw {
        message: response.error_msg || '未授权或登录已过期',
        code: response.error_code,
        data: response.data
      } as ApiError;
    }
    
    // 获取实际的数据
    let result: any = response.data;
    
    // 如果存在嵌套的data字段，提取出来
    if (result && typeof result === 'object' && 'data' in result) {
      result = result.data;
    }
    
    // 如果需要验证且数据是数组，进行过滤
    if (validate && Array.isArray(result)) {
      result = result.filter(validate);
    }
    
    return result as T;
  } catch (error: any) {
    if (error.code === 401) {
      await authService.clearAuthData();
    }
    throw error;
  } finally {
    setLoading(key, false);
  }
}

// Helper type for data validation
type ValidateFunction<T> = (data: any) => data is T;

// 添加调试日志
api.interceptors.request.use(request => {
  console.log('Starting Request:', request)
  return request
})

api.interceptors.response.use(response => {
  console.log('Response:', response)
  return response
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  async (response) => {
    console.log('Raw response:', response.data);
    
    if (!response.data || typeof response.data !== 'object') {
      const message = '服务器响应格式异常，请稍后重试';
      showAlert('错误提示', message);
      throw {
        message,
        code: -2,
        data: response.data,
        rawResponse: response
      } as ApiError;
    }
    
    const apiResponse = response.data;
    
    if (!('error_code' in apiResponse) || !('error_msg' in apiResponse)) {
      const message = '接口请求异常，请稍后重试';
      showAlert('错误提示', message);
      throw {
        message,
        code: -3,
        data: apiResponse,
        rawResponse: response
      } as ApiError;
    }

    if (apiResponse.error_code !== 0) {
      let errorMessage = ERROR_MESSAGES[apiResponse.error_code];
      if (!errorMessage) {
        errorMessage = apiResponse.error_msg === 'Unauthorized' ? '未授权或登录已过期' : (apiResponse.error_msg || '请求失败');
      }

      if (!isSilentError(apiResponse.error_code)) {
        showAlert('错误提示', errorMessage);
      }

      const error = {
        message: errorMessage,
        code: apiResponse.error_code,
        data: apiResponse.data,
      } as ApiError;

      if (apiResponse.error_code === 401) {
        await authService.clearAuthData();
      }
      
      throw error;
    }
    
    return {
      ...response,
      data: {
        error_code: 0,
        error_msg: '',
        data: apiResponse.data
      }
    };
  },
  async (error) => {
    let errorMessage = '请求失败';
    let errorCode = -1;
    
    if (error.response?.status === 200) {
      errorMessage = '服务器响应异常';
      errorCode = -2;
      error.rawResponse = error.response;
    } else if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.error_msg || '请求参数错误';
          errorCode = data.error_code || 1001;
          if (data.errors) {
            const validationErrors = Object.values(data.errors).flat();
            errorMessage = validationErrors.join('\n');
          }
          break;

        case 401:
          errorMessage = '未授权或登录已过期';
          errorCode = 401;
          await authService.clearAuthData();
          break;

        case 500:
          errorMessage = '服务错误，请稍后重试';
          errorCode = 1000;
          break;

        default:
          if (data?.error_msg) {
            errorMessage = data.error_msg;
            errorCode = data.error_code || status;
          }
      }
    } else if (error.request) {
      errorMessage = '网络错误，请检查网络连接';
      errorCode = -1;
    }
    
    if (!isSilentError(errorCode)) {
      showAlert('错误提示', errorMessage);
    }

    throw {
      message: errorMessage,
      code: errorCode,
      data: error.response?.data,
      errors: error.response?.data?.errors
    } as ApiError;
  }
);

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
    await authService.storeAuthData(authResponse.token, authResponse.user);
    return authResponse;
  },
  
  logout: async (): Promise<void> => {
    try {
      await withLoading<void>('logout', (api) => 
        api.post('/auth/logout')
      );
    } finally {
      await authService.clearAuthData();
    }
  },
  
  getProfile: async (): Promise<UserProfile> => {
    return withLoading<UserProfile>('getProfile', (api) => 
      api.get('/user/profile')
    );
  }
};

// 设置authService的API实例
authService.setAPI(authAPI);

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

interface TransactionSummary {
  total_income: string;
  total_expense: string;
}

export const transactionsAPI = {
  getSummary: async (): Promise<SingleApiResponse<TransactionSummary>> => {
    const response = await withLoading<SingleApiResponse<TransactionSummary>>('getTransactionSummary', (api) => 
      api.get('/transactions/summary')
    );
    
    if (response.error_code !== 0) {
      throw new Error(response.error_msg || 'Failed to get summary');
    }
    
    return response.data;
  },
  
  getAll: async (params?: { page?: string; per_page?: string; type?: string }): Promise<ListApiResponse<TransactionWithCategory>> => {
    return withLoading<ListApiResponse<TransactionWithCategory>>('getTransactions', (api) => 
      api.get('/transactions', { params })
    );
  },
  
  getById: async (id: string): Promise<SingleApiResponse<TransactionWithCategory>> => {
    const response = await withLoading<SingleApiResponse<TransactionWithCategory>>(`getTransaction_${id}`, (api) => 
      api.get(`/transactions/${id}`)
    );
    
    if (response.error_code !== 0) {
      throw new Error(response.error_msg || 'Failed to get transaction');
    }
    
    return response;
  },
  
  create: async (data: any): Promise<TransactionWithCategory> => {
    const response = await withLoading<TransactionWithCategory>('createTransaction', (api) => 
      api.post('/transactions', data)
    );
    
    console.log('Create transaction response:', response);
    return response;
  },
  
  update: async (id: string, data: any): Promise<SingleApiResponse<TransactionWithCategory>> => {
    const response = await withLoading<SingleApiResponse<TransactionWithCategory>>(`updateTransaction_${id}`, (api) => 
      api.put(`/transactions/${id}`, data)
    );
    
    if (response.error_code !== 0) {
      throw new Error(response.error_msg || 'Failed to update transaction');
    }
    
    return response;
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await withLoading<ApiResponse<void>>(`deleteTransaction_${id}`, (api) => 
      api.delete(`/transactions/${id}`)
    );
    
    if (response.error_code !== 0) {
      throw new Error(response.error_msg || 'Failed to delete transaction');
    }
    
    return response;
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
