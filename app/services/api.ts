import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Use browser alert for web, React Native Alert for mobile
const showAlert = (title: string, message: string) => {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${title}\n${message}`);
  }
};
import { API_URL } from '../utils/constants';

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
    id: number; // 将 id 类型从 string 改为 number
    email: string;
    name: string;
    avatar?: string | null; // avatar 也可以为 null
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
  (response) => {
    // 如果是调试输出，直接显示原始内容
    const contentType = response.headers['content-type'] || '';
    // if (contentType.includes('text/plain')) {
    //   console.log('Debug output:', response.data);
    //   return response;
    // }
    
    // 其余部分保持不变
    // 打印原始响应数据,用于调试
    console.log('Raw response:', response.data);
    
    // 处理空响应或非标准格式的响应
    if (!response.data || typeof response.data !== 'object') {
      console.log('Non-standard response:', response.data);
      const message = '服务器响应格式异常，请稍后重试';
        showAlert('错误提示', message);
      throw {
        message,
        code: -2,
        data: response.data,
        rawResponse: response // 保存原始响应用于调试
      } as ApiError;
    }
    
    const apiResponse = response.data;
    
    // 检查响应是否符合标准格式
    if (!('error_code' in apiResponse) || !('error_msg' in apiResponse)) {
      console.log('Invalid response format:', apiResponse);
      const message = '接口请求异常，请稍后重试';
      showAlert('错误提示', message);
      throw {
        message,
        code: -3,
        data: apiResponse,
        rawResponse: response
      } as ApiError;
    }

    console.log('apiResponse:', apiResponse);
    
    if (apiResponse.error_code !== 0) {
      const errorMessage = apiResponse.error_msg || ERROR_MESSAGES[apiResponse.error_code] || '请求失败';
      console.log('Error response:', errorMessage);
      // 特定错误码无需显示提示
      if (!isSilentError(apiResponse.error_code)) {
        showAlert('错误提示', errorMessage);
        throw new Error(errorMessage); // 模拟错误
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
    
    // 处理200状态码但响应异常的情况
    if (error.response?.status === 200) {
      console.log('Error with 200 status:', error.response.data);
      errorMessage = '服务器响应异常';
      errorCode = -2;
      // 保存原始响应数据
      error.rawResponse = error.response;
    } else if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // 处理验证错误或者请求参数错误
          errorMessage = data.error_msg || '请求参数错误';
          errorCode = data.error_code || 1001;
          // 可以在这里处理具体的验证错误
          if (data.errors) {
            // 如果后端返回具体的字段验证错误
            const validationErrors = Object.values(data.errors).flat();
            errorMessage = validationErrors.join('\n');
          }
          break;

        case 401:
          try {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            await new Promise(resolve => setTimeout(resolve, 100));
            errorMessage = '未授权或登录已过期';
            errorCode = 1002;
          } catch (e) {
            console.error('Failed to clear auth data:', e);
            errorMessage = '未授权或登录已过期';
            errorCode = 1002;
          }
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
      console.log(error);
      console.log('Request error:', error.request);
      errorMessage = '网络错误，请检查网络连接';
      errorCode = -1;
    } else {
      errorMessage = error.message || '请求失败';
      errorCode = -1;
    }
    
    // 可以根据需要决定是否显示错误提示
    if (!isSilentError(errorCode)) {
      showAlert('错误提示', errorMessage);
    }

    // 抛出统一的错误对象
    throw {
      message: errorMessage,
      code: errorCode,
      data: error.response?.data,
      errors: error.response?.data?.errors // 包含具体的验证错误信息
    } as ApiError;
  }
);

// Helper type for data validation
type ValidateFunction<T> = (data: any) => data is T;

// Helper function to wrap API calls with loading state and data validation
export async function withLoading<T>(
  key: string,
  apiCall: ApiRequest<T>,
  validate?: ValidateFunction<T>
): Promise<T> {
  setLoading(key, true);
  try {
    const response = await apiCall(api);
    
    // Handle plain text responses
    if (response.headers['content-type']?.includes('text/plain')) {
      return response.data as any;
    }

    // Handle non-standard responses with validation
    if (validate && (response.config as any)._nonStandardResponse) {
      console.log('Handling non-standard response with validation');
      const rawData = response.data;
      
      // Handle direct data
      if (Array.isArray(rawData)) {
        const validData = rawData.filter(validate);
        console.log(`Filtered ${validData.length} valid items from ${rawData.length} items`);
        return validData as any;
      }

      // Handle nested data
      if (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) {
        const validData = rawData.data.filter(validate);
        console.log(`Filtered ${validData.length} valid items from ${rawData.data.length} items`);
        return validData as any;
      }

      console.log('Invalid data format:', rawData);
      return (Array.isArray(rawData) ? [] : null) as any;
    }

    return response.data.data as T;
  } catch (error: any) {
    // Handle API errors with validation support
    if ((error.code === -2 || error.code === -3) && validate && error.rawResponse?.data) {
      console.log('Handling error response with validation');
      const rawData = error.rawResponse.data;
      
      // Apply the same validation logic for error cases
      if (Array.isArray(rawData)) {
        const validData = rawData.filter(validate);
        console.log(`Filtered ${validData.length} valid items from error response`);
        return validData as any;
      }

      if (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) {
        const validData = rawData.data.filter(validate);
        console.log(`Filtered ${validData.length} valid items from error response`);
        return validData as any;
      }

      return (Array.isArray(rawData) ? [] : null) as any;
    }
    throw error;
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
    const response = await withLoading<ApiResponse<AuthResponse>>('verifyCode', (api) =>
      api.post('/auth/verify-code', { email, code })
    );
  
    // 从 ApiResponse 中提取 data
    const authResponse = response.data;
    console.log('authResponse', authResponse);
  
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

import type { TransactionWithCategory } from '../types/transaction';

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
    
    return response;
  },
  getAll: async (params?: { page?: string; per_page?: string; type?: string }): Promise<ListApiResponse<TransactionWithCategory>> => {
    const response = await withLoading<ListApiResponse<TransactionWithCategory>>('getTransactions', (api) => 
      api.get('/transactions', { params })
    );
    
    if (response.error_code !== 0) {
      throw new Error(response.error_msg || 'Failed to get transactions');
    }
    
    return response;
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
  
  create: async (data: any): Promise<SingleApiResponse<TransactionWithCategory>> => {
    const response = await withLoading<SingleApiResponse<TransactionWithCategory>>('createTransaction', (api) => 
      api.post('/transactions', data)
    );
    
    if (response.error_code === 40000) {
      throw new Error(response.error_msg || 'Required fields are missing');
    }
    
    return response;
  },
  
  update: async (id: string, data: any): Promise<SingleApiResponse<TransactionWithCategory>> => {
    const response = await withLoading<SingleApiResponse<TransactionWithCategory>>(`updateTransaction_${id}`, (api) => 
      api.put(`/transactions/${id}`, data)
    );
    
    if (response.error_code === 40000) {
      throw new Error(response.error_msg || 'Required fields are missing');
    }
    
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
