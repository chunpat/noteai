import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './services/api';

// 合并 React Navigation 和 React Native Paper 的主题
const CombinedDefaultTheme = {
  ...NavigationDefaultTheme,
  ...DefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...DefaultTheme.colors,
    primary: '#6200EE',
    accent: '#03DAC6',
  },
};

const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...MD3DarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    accent: '#03DAC6',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    card: '#1E1E1E',
  },
};

// 创建认证上下文
export const AuthContext = React.createContext({
  signIn: async (token: string) => {},
  signOut: async () => {},
  isSignedIn: false,
});

export default function App() {
  // 使用深色主题
  const theme = CombinedDarkTheme;
  
  // 添加用户令牌状态，默认为 null
  const [userToken, setUserToken] = useState<string | null>(null);
  // 默认未登录状态
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  // 初始化时检查用户是否已登录
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // 从AsyncStorage获取用户令牌
        const token = await AsyncStorage.getItem('userToken');
        
        // 这里可以添加令牌有效性验证逻辑
        // 例如检查令牌是否过期，或者向后端验证令牌
        
        // 恢复之前的登录状态
        setUserToken(token);
        setIsSignedIn(!!token);
      } catch (e) {
        console.error('Failed to load auth token', e);
      }
    };

    bootstrapAsync();
  }, []);

  // 认证方法
  const authContext = React.useMemo(() => ({
    signIn: async (token: string) => {
      try {
        // 存储用户令牌
        await AsyncStorage.setItem('userToken', token);
        // 更新状态以触发重新渲染
        setUserToken(token);
        setIsSignedIn(true);
      } catch (e) {
        console.error('Failed to save auth token', e);
        throw e; // 抛出错误以便上层组件处理
      }
    },
    signOut: async () => {
      try {
        console.log('AuthContext: Starting logout process');
        
        // 调用后端退出登录接口
        await authAPI.logout();
        console.log('AuthContext: API logout successful');
        
        // 清除本地存储的数据
        await AsyncStorage.multiRemove([
          'userToken',
          'userData',
        ]);
        console.log('AuthContext: Local storage cleared');
        
        // 更新状态
        setUserToken(null);
        setIsSignedIn(false);
        console.log('AuthContext: State updated');
      } catch (e) {
        console.error('AuthContext: Failed to sign out:', e);
        throw e; // 重新抛出错误以便上层组件处理
      }
    },
    isSignedIn,
  }), [isSignedIn]);

  return (
    <AuthContext.Provider value={authContext}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer theme={theme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
