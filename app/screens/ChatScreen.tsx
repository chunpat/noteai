import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import api from '../services/api';
import { fetchSummary } from '../store/summarySlice';
import { addTransaction } from '../store/transactionsSlice';
import { fetchCategories, createCategory } from '../store/categorySlice';
import type { TransactionRequest } from '../types/transaction';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  transaction?: {
    amount: number;
    category: string;
    description: string;
    type: string;
    date: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: '你好！我是你的AI记账助手，可以帮你快速记录收支。\n\n试试对我说：\n"记一笔晚餐支出45元"\n"记录这个月工资收入8000元"',
    sender: 'bot',
    timestamp: new Date(),
  },
];

const ChatScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(state => state.categories.items);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleConfirmTransaction = async (transaction: Message['transaction']) => {
    if (!transaction) return;

    try {
      // Find matching category
      const matchingCategory = categories.find(cat => 
        cat.name === transaction.category && 
        cat.type === (transaction.type === '支出' ? 'expense' : 'income')
      );

      let categoryId;
      if (!matchingCategory) {
        // 创建新分类
          // 显示正在创建分类的提示消息
          const creatingMessage: Message = {
            id: messages.length + 1,
            text: `正在创建新分类：${transaction.category}...`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, creatingMessage]);

          const newCategory = await dispatch(createCategory({
            name: transaction.category,
            type: transaction.type === '支出' ? 'expense' : 'income',
            icon: 'help-circle-outline',
            sort: 0
          })).unwrap();
        categoryId = newCategory.id;
        await dispatch(fetchCategories()); // 刷新分类列表
      } else {
        categoryId = matchingCategory.id;
      }

      // Convert the AI analysis to TransactionRequest format
      const transactionRequest: TransactionRequest = {
        category_id: categoryId,
        amount: transaction.amount,
        transaction_date: transaction.date || new Date().toISOString().split('T')[0],
        note: transaction.description
      };
      
      await dispatch(addTransaction(transactionRequest));
      dispatch(fetchSummary());
      
      // 添加确认消息
      const confirmMessage: Message = {
        id: messages.length + 1,
        text: `好的，我已经帮你记录了这笔${transaction.type}！`,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, confirmMessage]);

    } catch (error) {
      Alert.alert('记录失败', '保存交易记录时出现错误，请重试');
    }
  };

  const handleCancelTransaction = () => {
    const cancelMessage: Message = {
      id: messages.length + 1,
      text: '好的，这次就不记录了。还有什么我可以帮你的吗？',
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, cancelMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // 添加机器人回复
    const loadingMessage: Message = {
      id: messages.length + 2,
      text: '正在分析你的记账需求...',
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, loadingMessage]);
    setInputText('');

    // 调用AI分析接口
    try {
      const response = await api.post('/transactions/analyze', {
        text: userMessage.text
      });

      const transaction = response.data.data.transaction;
      
      // 更新loading消息为分析结果
      const resultMessage: Message = {
        id: loadingMessage.id,
        text: `我帮你分析了一下：\n\n${transaction.type === '支出' ? '支出' : '收入'}金额：${transaction.amount}元\n分类：${transaction.category}\n描述：${transaction.description}\n\n要帮你记录这笔${transaction.type}吗？`,
        sender: 'bot',
        timestamp: new Date(),
        transaction: transaction
      };
      setMessages(messages => messages.map(msg => 
        msg.id === loadingMessage.id ? resultMessage : msg
      ));


    } catch (error) {
      // 更新loading消息为错误提示
      const errorMessage: Message = {
        id: loadingMessage.id,
        text: '抱歉，我没能理解你的记账需求，请换个方式描述试试？',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(messages => messages.map(msg =>
        msg.id === loadingMessage.id ? errorMessage : msg
      ));
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: 实现语音识别
  };

  const renderMessage = (message: Message) => {
    const hasTransaction = message.sender === 'bot' && message.transaction;
    
    return (
      <View 
        key={message.id}
        style={[
          styles.messageContainer,
          message.sender === 'user' ? styles.userMessage : styles.botMessage,
        ]}
      >
        <View style={styles.messageRow}>
          {message.sender === 'bot' && (
            <View style={styles.avatar}>
              <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
            </View>
          )}
          <View 
            style={[
              styles.messageBubble,
              message.sender === 'user' 
                ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
                : [styles.botBubble, { backgroundColor: theme.colors.surface }]
            ]}
          >
            <Text style={[
              styles.messageText,
              { color: message.sender === 'user' ? '#FFF' : theme.colors.onSurface }
            ]}>
              {message.text}
            </Text>
          </View>
          {message.sender === 'user' && (
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            </View>
          )}
        </View>
        {hasTransaction && (
          <View style={styles.transactionActions}>
            <Button 
              mode="contained"
              onPress={() => handleConfirmTransaction(message.transaction!)}
              style={styles.confirmButton}
            >
              确认记录
            </Button>
            <Button 
              mode="outlined"
              onPress={handleCancelTransaction}
              style={styles.cancelButton}
            >
              取消
            </Button>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={toggleRecording}
        >
          <Ionicons 
            name={isRecording ? 'stop-circle' : 'mic'} 
            size={24} 
            color={isRecording ? theme.colors.error : theme.colors.primary} 
          />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: theme.colors.onSurface }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入你要记录的收支..."
          placeholderTextColor="#666"
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={inputText.trim() ? theme.colors.primary : '#666'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'column',
    marginBottom: 16,
    alignItems: 'stretch',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  botBubble: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  voiceButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  confirmButton: {
    marginRight: 8,
  },
  cancelButton: {
    borderColor: '#666',
  },
});

export default ChatScreen;
