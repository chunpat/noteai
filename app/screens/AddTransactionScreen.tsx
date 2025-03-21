import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

interface Category {
  id: number;
  name: string;
  icon: IconName;
  color: string;
}

// 支出类别
const EXPENSE_CATEGORIES: Category[] = [
  { id: 1, name: '餐饮', icon: 'restaurant-outline', color: '#FF9800' },
  { id: 2, name: '交通', icon: 'car-outline', color: '#2196F3' },
  { id: 3, name: '购物', icon: 'cart-outline', color: '#E91E63' },
  { id: 4, name: '娱乐', icon: 'game-controller-outline', color: '#9C27B0' },
  { id: 5, name: '居家', icon: 'home-outline', color: '#4CAF50' },
  { id: 6, name: '通讯', icon: 'phone-portrait-outline', color: '#00BCD4' },
  { id: 7, name: '医疗', icon: 'medical-outline', color: '#F44336' },
  { id: 8, name: '其他', icon: 'apps-outline', color: '#607D8B' },
];

// 收入类别
const INCOME_CATEGORIES: Category[] = [
  { id: 1, name: '工资', icon: 'cash-outline', color: '#4CAF50' },
  { id: 2, name: '兼职', icon: 'briefcase-outline', color: '#8BC34A' },
  { id: 3, name: '理财', icon: 'trending-up', color: '#CDDC39' },
  { id: 4, name: '其他', icon: 'apps-outline', color: '#607D8B' },
];

interface Transaction {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  icon: IconName;
  color: string;
  description: string;
  date: string;
}

const AddTransactionScreen = ({ navigation }) => {
  const theme = useTheme();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;
    
    const transaction: Transaction = {
      type,
      amount: type === 'expense' ? -Number(amount) : Number(amount),
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      color: selectedCategory.color,
      description: note || selectedCategory.name,
      date: new Date().toISOString(),
    };
    
    // TODO: Add transaction to store/database
    console.log('New transaction:', transaction);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 顶部切换栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.typeSwitch}>
          <TouchableOpacity 
            style={[
              styles.typeButton,
              type === 'expense' && { backgroundColor: '#F4433620' }
            ]}
            onPress={() => setType('expense')}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && { color: '#F44336' }
            ]}>支出</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.typeButton,
              type === 'income' && { backgroundColor: '#4CAF5020' }
            ]}
            onPress={() => setType('income')}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'income' && { color: '#4CAF50' }
            ]}>收入</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* 金额输入 */}
      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>¥</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#666"
          keyboardType="decimal-pad"
          maxLength={10}
        />
      </View>

      {/* 类别选择 */}
      <Text style={styles.sectionTitle}>选择类别</Text>
      <ScrollView 
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory?.id === category.id && { backgroundColor: `${category.color}20` }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${category.color}33` }]}>
              <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <Text style={[
              styles.categoryName,
              selectedCategory?.id === category.id && { color: category.color }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 备注输入 */}
      <View style={styles.noteContainer}>
        <TextInput
          style={[styles.noteInput, { backgroundColor: theme.colors.surface }]}
          value={note}
          onChangeText={setNote}
          placeholder="添加备注..."
          placeholderTextColor="#666"
          multiline
          maxLength={50}
        />
      </View>

      {/* 保存按钮 */}
      <TouchableOpacity 
        style={[
          styles.saveButton,
          { backgroundColor: type === 'expense' ? '#F44336' : '#4CAF50' },
          (!amount || !selectedCategory) && styles.saveButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!amount || !selectedCategory}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  typeButtonText: {
    fontSize: 16,
    color: '#888',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  currencySymbol: {
    fontSize: 32,
    color: '#DDD',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    color: '#FFF',
    minWidth: 200,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#888',
    marginLeft: 16,
    marginBottom: 12,
  },
  categoryContainer: {
    maxHeight: 240,
  },
  categoryContent: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#DDD',
    textAlign: 'center',
  },
  noteContainer: {
    padding: 16,
  },
  noteInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 12,
    color: '#FFF',
    minHeight: 80,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;
