import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';
import AppNavigator from './AppNavigator';
import { AuthContext } from '../App';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isSignedIn } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        // 已登录状态显示主应用页面
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        // 未登录状态显示认证页面
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
