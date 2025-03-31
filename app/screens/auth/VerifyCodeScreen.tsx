import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { StackScreenProps } from "@react-navigation/stack";
import { AuthContext } from '../../App';
import { alert } from '../../utils/alert';
import authService from '../../services/auth';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

const CODE_LENGTH = 6;

type Props = StackScreenProps<AuthStackParamList, "VerifyCode">;

const VerifyCodeScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const { signIn } = useContext(AuthContext);
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = Array(CODE_LENGTH).fill(0).map(() => useRef<TextInput>(null));

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleCodeChange = useCallback((text: string, index: number) => {
    // 限制只能输入数字
    if (!/^\d*$/.test(text)) return;

    const newCode = code.split('');
    newCode[index] = text;
    const updatedCode = newCode.join('');
    setCode(updatedCode);

    // 自动跳转到下一个输入框
    if (text.length === 1 && index < CODE_LENGTH - 1) {
      inputRefs[index + 1].current?.focus();
    }

    // 当验证码填写完整时自动提交
    if (updatedCode.length === CODE_LENGTH) {
      handleVerify(updatedCode);
    }
  }, [code]);

  const handleResend = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await authService.sendVerificationCode(email);
      if (response.success) {
        setTimer(60);
        setCanResend(false);
        alert.show('提示', response.message);
      } else {
        alert.show('错误', response.message);
      }
    } catch (error) {
      alert.show('错误', '验证码发送失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [email, loading]);

  const handleVerify = useCallback(async (verifyCode: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await authService.verifyCode(email, verifyCode);
      // 验证成功，使用返回的 token 登录
      await signIn(response.token, response.user);
    } catch (error) {
      alert.show('错误', '验证码错误，请重试');
      setCode('');
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }, [email, loading, signIn]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>验证邮箱</Text>
        <Text style={styles.subtitle}>验证码已发送至 {email}</Text>
      </View>

      <View style={styles.codeContainer}>
        {Array(CODE_LENGTH).fill(0).map((_, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={[
              styles.codeInput,
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
                color: theme.colors.onSurface,
              },
            ]}
            maxLength={1}
            keyboardType="number-pad"
            value={code[index] || ''}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                inputRefs[index - 1].current?.focus();
              }
            }}
            editable={!loading}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.timerText}>
          {canResend ? '' : `${timer}秒后`}
        </Text>
        <TouchableOpacity 
          onPress={handleResend}
          disabled={!canResend || loading}
        >
          <Text style={[
            styles.resendText,
            { color: theme.colors.primary },
            (!canResend || loading) && styles.resendTextDisabled,
          ]}>
            {loading ? "发送中..." : "重新发送验证码"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  codeInput: {
    width: 45,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
});

export default VerifyCodeScreen;
