import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // 添加机器人回复
    const botMessage: Message = {
      id: messages.length + 2,
      text: '正在分析你的记账需求...',
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, botMessage]);
    setInputText('');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: 实现语音识别
  };

  const renderMessage = (message: Message) => (
    <View 
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
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
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
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
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
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
});

export default ChatScreen;
