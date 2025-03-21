import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// 模拟数据 - 实际应用中应从API获取
const MOCK_DATA = {
  totalAssets: 12580.00,
  cashAssets: 3580.00,
  investmentAssets: 9000.00,
  accounts: [
    { id: 1, name: '现金', icon: 'cash', balance: 580.00, color: '#4CAF50', type: 'cash' },
    { id: 2, name: '微信', icon: 'logo-wechat', balance: 1200.00, color: '#07C160', type: 'cash' },
    { id: 3, name: '支付宝', icon: 'logo-alipay', balance: 1800.00, color: '#1677FF', type: 'cash' },
    { id: 4, name: '股票', icon: 'trending-up', balance: 5000.00, color: '#F44336', type: 'investment' },
    { id: 5, name: '基金', icon: 'pie-chart', balance: 4000.00, color: '#FF9800', type: 'investment' },
  ],
  recentTransactions: [
    { id: 1, account: '微信', amount: -58.00, description: 'AI服务', date: '今天 18:50', type: 'expense' },
    { id: 2, account: '支付宝', amount: 60.00, description: '零工收入', date: '今天 17:01', type: 'income' },
    { id: 3, account: '现金', amount: -120.00, description: '餐饮', date: '昨天 12:30', type: 'expense' },
    { id: 4, account: '股票', amount: 200.00, description: '股息', date: '3月15日', type: 'income' },
  ]
};

const AssetsScreen = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'cash', 'investment'
  
  // 根据当前选中的标签过滤账户
  const filteredAccounts = activeTab === 'all' 
    ? MOCK_DATA.accounts 
    : MOCK_DATA.accounts.filter(account => account.type === activeTab);
  
  // 渲染账户卡片
  const renderAccountCard = (account) => (
    <TouchableOpacity 
      key={account.id} 
      style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.accountIcon, { backgroundColor: `${account.color}33` }]}>
        <Ionicons name={account.icon} size={24} color={account.color} />
      </View>
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountBalance}>¥{account.balance.toFixed(2)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );
  
  // 渲染最近交易
  const renderRecentTransaction = (transaction) => (
    <View 
      key={transaction.id} 
      style={styles.transactionItem}
    >
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAccount}>{transaction.account}</Text>
        <Text style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}
          {Math.abs(transaction.amount).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>资产</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* 资产总览卡片 */}
      <View style={[styles.totalAssetsCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.totalAssetsLabel}>总资产 (元)</Text>
        <Text style={styles.totalAssetsValue}>{MOCK_DATA.totalAssets.toFixed(2)}</Text>
        
        <View style={styles.assetsBreakdown}>
          <View style={styles.assetTypeContainer}>
            <Text style={styles.assetTypeLabel}>现金资产</Text>
            <Text style={styles.assetTypeValue}>{MOCK_DATA.cashAssets.toFixed(2)}</Text>
          </View>
          <View style={styles.assetDivider} />
          <View style={styles.assetTypeContainer}>
            <Text style={styles.assetTypeLabel}>投资资产</Text>
            <Text style={styles.assetTypeValue}>{MOCK_DATA.investmentAssets.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      
      {/* 账户类型标签 */}
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
            activeTab === 'cash' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('cash')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'cash' && [styles.activeTabText, { color: theme.colors.primary }]
          ]}>
            现金账户
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'investment' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('investment')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'investment' && [styles.activeTabText, { color: theme.colors.primary }]
          ]}>
            投资账户
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* 账户列表 */}
        <View style={styles.accountsContainer}>
          {filteredAccounts.map(renderAccountCard)}
        </View>
        
        {/* 最近交易 */}
        <View style={styles.recentTransactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>最近交易</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          {MOCK_DATA.recentTransactions.map(renderRecentTransaction)}
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAssetsCard: {
    margin: 12,
    padding: 20,
    borderRadius: 12,
  },
  totalAssetsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  totalAssetsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  assetsBreakdown: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  assetTypeContainer: {
    flex: 1,
  },
  assetTypeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  assetTypeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  assetDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
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
  scrollView: {
    flex: 1,
  },
  accountsContainer: {
    padding: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DDD',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 16,
    color: '#FFF',
  },
  recentTransactionsContainer: {
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#DDD',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAccount: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssetsScreen; 