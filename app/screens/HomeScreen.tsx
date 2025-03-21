import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// 模拟数据
const MOCK_DATA = {
  income: 12000.00,
  expense: 3420.00,
  recentTransactions: [
    { id: 1, amount: -58.00, description: '订阅服务', date: '今天 18:50', type: 'expense' },
    { id: 2, amount: 60.00, description: '兼职收入', date: '今天 17:01', type: 'income' },
    { id: 3, amount: -120.00, description: '日常支出', date: '昨天 12:30', type: 'expense' },
    { id: 4, amount: -35.00, description: '交通费用', date: '昨天 09:15', type: 'expense' },
    { id: 5, amount: 8000.00, description: '工资收入', date: '3月15日', type: 'income' },
  ]
};

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'income', 'expense'
  
  // 根据当前选中的标签过滤交易
  const filteredTransactions = activeTab === 'all' 
    ? MOCK_DATA.recentTransactions 
    : MOCK_DATA.recentTransactions.filter(transaction => transaction.type === activeTab);
  
  // 渲染交易项
  const renderTransactionItem = (transaction) => (
    <TouchableOpacity 
      key={transaction.id} 
      style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'income' ? '#4CAF5033' : '#F4433633' }]}>
        <Ionicons 
          name={transaction.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'} 
          size={20} 
          color={transaction.type === 'income' ? '#4CAF50' : '#F44336'} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
      ]}>
        {transaction.type === 'income' ? '+' : '-'}
        {Math.abs(transaction.amount).toFixed(2)}
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
      
      <ScrollView style={styles.scrollView}>
        {/* 收支统计 */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF5020' }]}>
            <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />
            <Text style={styles.statLabel}>总收入</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>¥{MOCK_DATA.income.toFixed(2)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F4433620' }]}>
            <Ionicons name="arrow-up-circle" size={24} color="#F44336" />
            <Text style={styles.statLabel}>总支出</Text>
            <Text style={[styles.statValue, { color: '#F44336' }]}>¥{MOCK_DATA.expense.toFixed(2)}</Text>
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
});

export default HomeScreen;
