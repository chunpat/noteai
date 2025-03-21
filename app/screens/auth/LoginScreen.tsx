import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, subscribeToLoading } from '../../services/api';
import CustomAlert from '../../components/CustomAlert';

interface LoginScreenProps {
  navigation: any; // 实际项目中应使用正确的Navigation类型
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null as (() => void) | null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToLoading('sendCode', setIsLoading);
    return unsubscribe;
  }, []);

  const showSuccessAlert = useCallback((message: string) => {
    setAlertConfig({
      visible: true,
      title: '提示',
      message,
      onConfirm: () => {
        navigation.navigate('VerifyCode', { email });
      },
    });
  }, [email, navigation]);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (alertConfig.onConfirm) {
      alertConfig.onConfirm();
    }
  }, [alertConfig.onConfirm]);

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    // 空值检查
    if (!email.trim()) {
      setEmailError('请输入邮箱地址');
      return false;
    }

    // 邮箱格式检查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('请输入有效的邮箱地址');
      return false;
    }

    setEmailError('');
    return true;
  };

  // 处理邮箱输入变化
  const handleEmailChange = (text: string): void => {
    setEmail(text);
    if (emailError) {
      validateEmail(text);
    }
  };

  // 发送验证码
  const sendVerificationCode = async (): Promise<void> => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      await authAPI.sendCode(email);
      showSuccessAlert('验证码已发送，请查收');
    } catch {
      // 错误已由 API 服务统一处理
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="wallet-outline" size={40} color="#FFF" />
          </View>
          <Text style={[styles.appName, { color: theme.colors.primary }]}>NoteAI</Text>
          <Text style={styles.appSlogan}>智能财务助手</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>登录</Text>
          <Text style={styles.subtitle}>请输入您的邮箱，我们将发送验证码</Text>

          <View style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer, 
              { backgroundColor: theme.colors.surface },
              emailError ? styles.inputError : null
            ]}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#FFFFFF' }]}
                placeholder="请输入邮箱地址"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => validateEmail(email)}
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: theme.colors.primary },
              isLoading && styles.buttonDisabled
            ]}
            onPress={sendVerificationCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>发送验证码</Text>
            )}
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              登录即表示您同意我们的
              <Text style={[styles.termsLink, { color: theme.colors.primary }]}> 服务条款 </Text>
              和
              <Text style={[styles.termsLink, { color: theme.colors.primary }]}> 隐私政策</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onDismiss={hideAlert}
        onConfirm={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 16,
    color: '#888',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: 'bold',
  }
});

export default LoginScreen;
