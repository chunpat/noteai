import api from './api';

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

class AuthService {
  // 发送验证码
  async sendVerificationCode(email: string): Promise<SendCodeResponse> {
    try {
      const response = await api.post('/auth/send-code', { email });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 退出登录
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 获取用户信息
  async getUserProfile(): Promise<any> {
    try {
      const response = await api.get('/user/profile');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 统一的错误处理
  private handleError(error: any): Error {
    if (error.response) {
      // 服务器返回了错误响应
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return new Error(data.message || '请求参数错误');
        case 401:
          return new Error(data.message || '未授权或登录已过期');
        case 404:
          return new Error(data.message || '请求的资源不存在');
        case 429:
          return new Error(data.message || '请求过于频繁，请稍后再试');
        case 500:
          return new Error(data.message || '服务器内部错误');
        default:
          return new Error(data.message || '未知错误');
      }
    }
    if (error.request) {
      // 请求已发出，但没有收到响应
      return new Error('网络请求失败，请检查网络连接');
    }
    // 请求配置出错
    return new Error('请求配置错误');
  }
}

export const authService = new AuthService();
export default authService; 