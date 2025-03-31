import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// 导入认证相关页面
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';

// 定义认证导航参数列表类型
export type AuthStackParamList = {
  Login: undefined;
  VerifyCode: { email: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

// 认证导航器
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
