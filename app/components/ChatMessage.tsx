import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Paragraph, Text, useTheme } from 'react-native-paper';
import { Message } from '../store/chatSlice';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const theme = useTheme();
  const isUser = message.sender === 'user';
  
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <Card style={[styles.messageCard, isUser ? styles.userMessage : styles.aiMessage]}>
        <Card.Content>
          <Paragraph style={isUser ? styles.userMessageText : styles.aiMessageText}>
            {message.content}
          </Paragraph>
        </Card.Content>
      </Card>
      
      {message.transactionData && (
        <Card style={styles.transactionCard}>
          <Card.Content>
            <Paragraph style={styles.transactionTitle}>已记录交易:</Paragraph>
            <View style={styles.transactionDetails}>
              <Paragraph>金额: ¥{message.transactionData.amount.toFixed(2)}</Paragraph>
              <Paragraph>类别: {message.transactionData.category}</Paragraph>
              <Paragraph>描述: {message.transactionData.description}</Paragraph>
              <Paragraph>日期: {new Date(message.transactionData.date).toLocaleDateString()}</Paragraph>
              <Paragraph>类型: {message.transactionData.type === 'income' ? '收入' : '支出'}</Paragraph>
            </View>
          </Card.Content>
        </Card>
      )}
      
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  messageCard: {
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  transactionCard: {
    marginTop: 8,
    backgroundColor: '#F8F8F8',
  },
  transactionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDetails: {
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});

export default ChatMessage; 