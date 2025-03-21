import React, { useState, useEffect, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AuthContext } from '../App';

// 导入导航器
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

// 定义根导航参数列表类型
type RootStackParamList = {
  Auth: undefined;
  AppTabs: undefined;
  Loading: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// 加载页面
const LoadingScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

// 根导航器
const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn } = useContext(AuthContext);

  // 检查用户是否已登录
  useEffect(() => {
    // App.tsx now properly manages auth state, we can immediately show the correct screen
    setIsLoading(false);
  }, []);

  // 当 isSignedIn 状态变化时，确保导航器正确响应
  useEffect(() => {
    console.log('Authentication state changed:', isSignedIn ? 'Signed In' : 'Signed Out');
  }, [isSignedIn]);

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="AppTabs" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
