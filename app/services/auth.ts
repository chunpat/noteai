import api, { authAPI } from './api';
import type { ApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user'
};

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
}

export interface VerifyCodeResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

class AuthService {
  async storeAuthData(token: string, user: UserData) {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  async clearAuthData() {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  }

  async getStoredAuthData() {
    try {
      const [token, userJson] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER
      ]);
      
      if (!token[1]) return null;
      
      return {
        token: token[1],
        user: userJson[1] ? JSON.parse(userJson[1]) : null
      };
    } catch (error) {
      console.error('Error reading auth data:', error);
      return null;
    }
  }

  async sendVerificationCode(email: string): Promise<SendCodeResponse> {
    try {
      await authAPI.sendCode(email);
      return {
        success: true,
        message: '验证码已发送'
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message || '发送验证码失败'
      };
    }
  }

  async verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
    const response = await authAPI.verifyCode(email, code);
    // 存储认证信息
    await this.storeAuthData(response.token, response.user);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } finally {
      // 无论登出API是否成功，都清除本地存储
      await this.clearAuthData();
    }
  }

  async getUserProfile(): Promise<any> {
    return await authAPI.getProfile();
  }
}

export const authService = new AuthService();
export default authService;
