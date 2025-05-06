import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent 
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../store/transactionsSlice';
import { fetchSummary } from '../store/summarySlice';
import type { AppDispatch, RootState } from '../store';
import type { TransactionWithCategory } from '../types/transaction';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const summary = useSelector((state: RootState) => state.summary);
  
  const { items: transactions, status, error, pagination, hasMore } = useSelector((state: RootState) => state.transactions);
  
  // Fetch summary and transaction data when tab changes
  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchTransactions({ 
      page: 1, 
      perPage: 10, 
      refresh: true,
      type: activeTab
    }));
  }, [dispatch, activeTab]);

  // Handle load more
  const handleLoadMore = () => {
    if (status !== 'loading' && hasMore) {
      dispatch(fetchTransactions({ 
        page: pagination.currentPage + 1,
        perPage: pagination.perPage,
        type: activeTab
      }));
    }
  };

  // Handle scroll to bottom
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 10;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
      
    if (isCloseToBottom) {
      handleLoadMore();
    }
  };

  // Log state changes
  useEffect(() => {
    console.log('Transaction state updated:', {
      status,
      count: transactions.length,
      error
    });
  }, [transactions, status, error]);

  // Calculate totals
  const totals = transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.category.type === 'income') {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  // No need to filter transactions manually since we're getting filtered data from API
  const filteredTransactions = transactions;

  const formatDate = (dateStr: string, createdAt: string) => {
    // 使用 transaction_date 判断日期
    const date = dayjs(dateStr);
    const now = dayjs();
    
    // 使用 created_at 显示具体时间
    const createdTime = dayjs(createdAt);
    
    if (date.isSame(now, 'day')) {
      return `今天 ${createdTime.format('HH:mm')}`;
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return `昨天 ${createdTime.format('HH:mm')}`;
    } else {
      return date.format('M月D日');
    }
  };
  
  const renderTransactionItem = (transaction: TransactionWithCategory) => (
    <TouchableOpacity 
      key={transaction.id} 
      style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: transaction.category.type === 'income' ? '#4CAF5033' : '#F4433633' }]}>
        <Ionicons 
          name={transaction.category.icon} 
          size={20} 
          color={transaction.category.type === 'income' ? '#4CAF50' : '#F44336'} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>
          {transaction.category.name || `${transaction.category.type === 'income' ? '收入' : '支出'}${transaction.category.sort || ''}`}
          {transaction.note ? ` - ${transaction.note}` : ''}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.transaction_date, transaction.created_at)}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.category.type === 'income' ? '#4CAF50' : '#F44336' }
      ]}>
        {transaction.category.type === 'income' ? '+' : '-'}
        {Math.abs(Number(transaction.amount)).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>你好，</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>收支记录</Text>
        </View>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {/* 收支统计 */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF5020' }]}>
            <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />
            <Text style={styles.statLabel}>总收入</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>¥{Number(summary.total_income || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F4433620' }]}>
            <Ionicons name="arrow-up-circle" size={24} color="#F44336" />
            <Text style={styles.statLabel}>总支出</Text>
            <Text style={[styles.statValue, { color: '#F44336' }]}>¥{Number(summary.total_expense || 0).toFixed(2)}</Text>
          </View>
        </View>
        
        {/* 收支记录列表 */}
        <View style={[styles.listContainer, { backgroundColor: theme.colors.surface }]}>          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'all' && [styles.activeTab, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'all' && [styles.activeTabText, { color: theme.colors.primary }]
              ]}>
                全部
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'income' && [styles.activeTab, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => setActiveTab('income')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'income' && [styles.activeTabText, { color: theme.colors.primary }]
              ]}>
                收入
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'expense' && [styles.activeTab, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => setActiveTab('expense')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'expense' && [styles.activeTabText, { color: theme.colors.primary }]
              ]}>
                支出
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsList}>
            {filteredTransactions.map(renderTransactionItem)}
            {status === 'loading' && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
            {status === 'failed' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>加载失败，请重试</Text>
              </View>
            )}
            {filteredTransactions.length === 0 && status !== 'loading' && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无交易记录</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActionButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DDD',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  errorText: {
    color: '#CF6679',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
