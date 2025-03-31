import React, { useState, useEffect, createContext, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import RootNavigator from './navigation/RootNavigator';
import CustomAlert from './components/CustomAlert';
import { AlertContext, AlertState } from './utils/alert';
import authService, { UserData } from './services/auth';

// 自定义主题
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6200EE',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
  },
};

// 认证上下文
export interface AuthContextType {
  isSignedIn: boolean;
  user: UserData | null;
  signIn: (token: string, userData: UserData) => Promise<void>;
  signOut: () => Promise<void>;
}

const initialAuthContext: AuthContextType = {
  isSignedIn: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
};

export const AuthContext = createContext<AuthContextType>(initialAuthContext);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  // Alert state
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const authData = await authService.getStoredAuthData();
      if (authData?.token && authData?.user) {
        setIsSignedIn(true);
        setUser(authData.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    globalThis.showAlert = (options) => {
      setAlertState({
        ...options,
        visible: true,
      });
    };

    return () => {
      globalThis.showAlert = undefined;
    };
  }, []);

  const authContext: AuthContextType = {
    isSignedIn,
    user,
    signIn: async (token, userData) => {
      try {
        await authService.storeAuthData(token, userData);
        setIsSignedIn(true);
        setUser(userData);
      } catch (error) {
        console.error('Failed to store auth data:', error);
      }
    },
    signOut: async () => {
      try {
        await authService.clearAuthData();
        setIsSignedIn(false);
        setUser(null);
      } catch (error) {
        console.error('Failed to clear auth data:', error);
      }
    },
  };

  const alertContext = {
    alertState,
    showAlert: (options: any) => {
      setAlertState({
        ...options,
        visible: true,
      });
    },
    hideAlert: () => {
      setAlertState(prev => ({
        ...prev,
        visible: false,
      }));
    },
  };

  if (isLoading) {
    return null; // 或者显示加载指示器
  }

  return (
    <AuthContext.Provider value={authContext}>
      <AlertContext.Provider value={alertContext}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <RootNavigator />
            <CustomAlert />
          </NavigationContainer>
        </PaperProvider>
      </AlertContext.Provider>
    </AuthContext.Provider>
  );
}
