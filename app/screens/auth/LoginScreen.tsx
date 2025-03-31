import React, { useState, useContext, useCallback } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { AuthContext } from "../../App";
import { alert } from "../../utils/alert";
import authService from "../../services/auth";
import type { SendCodeResponse } from "../../services/auth";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

type Props = StackScreenProps<AuthStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSendCode = useCallback(async () => {
    if (!email || !validateEmail(email)) {
      alert.show("提示", "请输入正确的邮箱地址");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const response = await authService.sendVerificationCode(email);
      if (response.success) {
        alert.show("提示", response.message);
        navigation.navigate("VerifyCode", { email });
      } else {
        // 显示失败消息
        alert.show("错误", response.message);
      }
    } catch (error) {
      // 如果连接到服务器失败，这里会捕获到网络错误
      alert.show("错误", "无法连接到服务器，请检查网络连接");
    } finally {
      setLoading(false);
    }
  }, [email, loading, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>登录 / 注册</Text>
        <Text style={styles.subtitle}>登录后开启你的智能记账之旅</Text>
      </View>

      <View style={styles.form}>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
          </View>
          
          <TextInput
            style={[styles.input, { color: theme.colors.onSurface }]}
            placeholder="请输入邮箱地址"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.button,
            { 
              backgroundColor: validateEmail(email) ? theme.colors.primary : "#333",
              opacity: validateEmail(email) ? 1 : 0.6,
            },
          ]}
          onPress={handleSendCode}
          disabled={!validateEmail(email) || loading}
        >
          <Text style={styles.buttonText}>{loading ? "发送中..." : "获取验证码"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>登录即代表同意</Text>
        <TouchableOpacity>
          <Text style={[styles.link, { color: theme.colors.primary }]}>《用户协议》</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>和</Text>
        <TouchableOpacity>
          <Text style={[styles.link, { color: theme.colors.primary }]}>《隐私政策》</Text>
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
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  inputIconContainer: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingRight: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
  },
});

export default LoginScreen;
