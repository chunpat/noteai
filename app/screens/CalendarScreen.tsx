import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// 模拟数据 - 实际应用中应从API获取
const MOCK_DATA = {
  currentMonth: '2024年3月',
  days: [
    { date: '1', weekday: '五', transactions: [] },
    { date: '2', weekday: '六', transactions: [] },
    { date: '3', weekday: '日', transactions: [] },
    { date: '4', weekday: '一', transactions: [] },
    { date: '5', weekday: '二', transactions: [] },
    { date: '6', weekday: '三', transactions: [] },
    { date: '7', weekday: '四', transactions: [] },
    { date: '8', weekday: '五', transactions: [] },
    { date: '9', weekday: '六', transactions: [] },
    { date: '10', weekday: '日', transactions: [] },
    { date: '11', weekday: '一', transactions: [] },
    { date: '12', weekday: '二', transactions: [] },
    { date: '13', weekday: '三', transactions: [] },
    { date: '14', weekday: '四', transactions: [] },
    { date: '15', weekday: '五', transactions: [
      { id: 1, category: '餐饮', amount: -320.00, type: 'expense' },
      { id: 2, category: '工资', amount: 560.00, type: 'income' },
    ] },
    { date: '16', weekday: '六', transactions: [] },
    { date: '17', weekday: '日', transactions: [
      { id: 3, category: 'AI服务', amount: -58.00, type: 'expense' },
      { id: 4, category: '零工收入', amount: 60.00, type: 'income' },
    ] },
    { date: '18', weekday: '一', transactions: [] },
    { date: '19', weekday: '二', transactions: [] },
    { date: '20', weekday: '三', transactions: [] },
    { date: '21', weekday: '四', transactions: [] },
    { date: '22', weekday: '五', transactions: [] },
    { date: '23', weekday: '六', transactions: [] },
    { date: '24', weekday: '日', transactions: [] },
    { date: '25', weekday: '一', transactions: [] },
    { date: '26', weekday: '二', transactions: [] },
    { date: '27', weekday: '三', transactions: [] },
    { date: '28', weekday: '四', transactions: [] },
    { date: '29', weekday: '五', transactions: [] },
    { date: '30', weekday: '六', transactions: [] },
    { date: '31', weekday: '日', transactions: [] },
  ]
};

const CalendarScreen = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState('17');
  
  // 获取选中日期的交易数据
  const selectedDayData = MOCK_DATA.days.find(day => day.date === selectedDate);
  
  // 渲染日历头部（星期几）
  const renderWeekDays = () => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>
    );
  };
  
  // 渲染日历日期
  const renderCalendarDays = () => {
    // 计算本月第一天是星期几（0-6，0表示星期日）
    const firstDayOfMonth = MOCK_DATA.days[0].weekday;
    const firstDayIndex = ['日', '一', '二', '三', '四', '五', '六'].indexOf(firstDayOfMonth);
    
    // 创建日历网格
    const calendarDays = [];
    
    // 添加空白格子
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }
    
    // 添加日期格子
    MOCK_DATA.days.forEach(day => {
      const hasTransactions = day.transactions.length > 0;
      const isSelected = day.date === selectedDate;
      
      calendarDays.push(
        <TouchableOpacity
          key={day.date}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell
          ]}
          onPress={() => setSelectedDate(day.date)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText
          ]}>
            {day.date}
          </Text>
          {hasTransactions && (
            <View style={[
              styles.transactionDot,
              { backgroundColor: theme.colors.primary }
            ]} />
          )}
        </TouchableOpacity>
      );
    });
    
    return (
      <View style={styles.calendarGrid}>
        {calendarDays}
      </View>
    );
  };
  
  // 渲染选中日期的交易记录
  const renderTransactions = () => {
    if (!selectedDayData || selectedDayData.transactions.length === 0) {
      return (
        <View style={styles.emptyTransactions}>
          <Ionicons name="calendar-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>当日无交易记录</Text>
        </View>
      );
    }
    
    return selectedDayData.transactions.map(transaction => (
      <View 
        key={transaction.id} 
        style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.transactionLeft}>
          <View style={[
            styles.categoryIcon,
            { backgroundColor: transaction.type === 'income' ? '#4CAF5033' : '#F4433633' }
          ]}>
            <Ionicons 
              name={transaction.type === 'income' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color={transaction.type === 'income' ? '#4CAF50' : '#F44336'} 
            />
          </View>
          <Text style={styles.categoryText}>{transaction.category}</Text>
        </View>
        <Text style={[
          styles.amountText,
          { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}
          {Math.abs(transaction.amount).toFixed(2)}
        </Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>日历</Text>
      </View>
      
      <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.monthSelector}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{MOCK_DATA.currentMonth}</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {renderWeekDays()}
        {renderCalendarDays()}
      </View>
      
      <View style={styles.transactionsHeader}>
        <Text style={[styles.transactionsTitle, { color: theme.colors.primary }]}>
          {MOCK_DATA.currentMonth}{selectedDate}日 交易记录
        </Text>
      </View>
      
      <ScrollView style={styles.transactionsContainer}>
        {renderTransactions()}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarContainer: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DDD',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  selectedDayCell: {
    backgroundColor: '#6200EE33',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: '#DDD',
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  transactionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  transactionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyTransactions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#888',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#DDD',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen; 