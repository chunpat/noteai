import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
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
import { AuthContext } from '../../App';
import { authAPI, subscribeToLoading } from '../../services/api';
import CustomAlert from '../../components/CustomAlert';

interface ApiError {
  message: string;
  code: number;
  data?: any;
}

const ERROR_MESSAGES = {
  2001: '验证码已过期，请重新获取',
  2002: '验证码错误，请重新输入',
};

const VerifyCodeScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '提示',
    message: '',
    onConfirm: null as (() => void) | null,
  });
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const unsubscribeVerify = subscribeToLoading('verifyCode', setVerifyLoading);
    const unsubscribeResend = subscribeToLoading('sendCode', setResendLoading);
    return () => {
      unsubscribeVerify();
      unsubscribeResend();
    };
  }, []);

  // 倒计时
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const showAlert = useCallback((message: string, onConfirm?: () => void) => {
    setAlertConfig({
      visible: true,
      title: '提示',
      message,
      onConfirm: onConfirm || null,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (alertConfig.onConfirm) {
      alertConfig.onConfirm();
    }
  }, [alertConfig.onConfirm]);

  // 处理验证码输入
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // 自动跳转到下一个输入框
    if (text && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 处理删除键
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 清空验证码
  const resetCode = useCallback(() => {
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  }, []);

  // 处理验证码过期
  const handleCodeExpired = useCallback(() => {
    resetCode();
    setTimer(0);
    setCanResend(true);
  }, [resetCode]);

  // 处理验证错误
  const handleVerifyError = useCallback((error: ApiError) => {
    if (error.code === 2002) { // 验证码错误
      resetCode();
      showAlert(ERROR_MESSAGES[error.code]);
    } else if (error.code === 2001) { // 验证码过期
      handleCodeExpired();
      showAlert(ERROR_MESSAGES[error.code]);
    } else {
      showAlert(error.message);
    }
  }, [resetCode, handleCodeExpired, showAlert]);

  // 验证验证码
  const verifyCode = async (): Promise<void> => {
    const verificationCode = code.join('');
    // Check if any code digit is empty
    if (code.some(digit => digit === '')) {
      showAlert('请输入完整的验证码');
      return;
    }

    try {
      const response = await authAPI.verifyCode(email, verificationCode);
      await authContext.signIn(response.token);
      showAlert('验证成功，即将进入应用...', () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],
        });
      });
    } catch (error) {
      handleVerifyError(error as ApiError);
    }
  };

  // 重新发送验证码
  const resendCode = async (): Promise<void> => {
    if (!canResend) return;
    
    setTimer(60);
    setCanResend(false);
    
    try {
      await authAPI.sendCode(email);
      showAlert('验证码已重新发送');
    } catch (error) {
      setTimer(0);
      setCanResend(true);
      showAlert((error as ApiError).message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>验证邮箱</Text>
          <Text style={styles.subtitle}>
            我们已向 <Text style={styles.emailText}>{email}</Text> 发送了验证码
          </Text>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.codeInput, 
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: digit ? theme.colors.primary : 'transparent',
                    color: '#FFFFFF'
                  }
                ]}
                value={digit}
                onChangeText={text => handleCodeChange(text.replace(/[^0-9]/g, ''), index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!verifyLoading}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: theme.colors.primary },
              verifyLoading && styles.buttonDisabled
            ]}
            onPress={verifyCode}
            disabled={verifyLoading}
          >
            {verifyLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>验证</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              没有收到验证码？
            </Text>
            {canResend ? (
              <TouchableOpacity 
                onPress={resendCode}
                disabled={resendLoading}
              >
                <Text style={[
                  styles.resendButton, 
                  { color: theme.colors.primary },
                  resendLoading && styles.buttonDisabled
                ]}>
                  重新发送
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                {timer}秒后可重新发送
              </Text>
            )}
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
  header: {
    padding: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  emailText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#888',
  },
  resendButton: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timerText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
});

export default VerifyCodeScreen;
