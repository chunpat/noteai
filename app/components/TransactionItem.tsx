import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction } from '../store/transactionsSlice';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const theme = useTheme();
  const isIncome = transaction.type === 'income';
  
  // Find category info
  const categoryList = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryInfo = categoryList.find(c => c.id === transaction.category) || 
    { name: '其他', icon: 'dots-horizontal' };
  
  const handlePress = () => {
    if (onPress) {
      onPress(transaction);
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: isIncome ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
              <MaterialCommunityIcons 
                name={categoryInfo.icon} 
                size={24} 
                color={isIncome ? theme.colors.success : theme.colors.error} 
              />
            </View>
            
            <View style={styles.contentContainer}>
              <Title style={styles.title}>{transaction.description}</Title>
              <Paragraph style={styles.category}>{categoryInfo.name}</Paragraph>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={[
                styles.amount, 
                { color: isIncome ? theme.colors.success : theme.colors.error }
              ]}>
                {isIncome ? '+' : '-'}¥{transaction.amount.toFixed(2)}
              </Text>
              <Text style={styles.date}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default TransactionItem; 