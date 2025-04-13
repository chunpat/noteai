import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../store/transactionsSlice';
import { fetchCategories } from '../store/categorySlice';
import type { TransactionRequest } from '../types/transaction';
import type { Category } from '../types/category';
import type { AppDispatch, RootState } from '../store';

const DEFAULT_CATEGORY_COLOR = {
  expense: '#F44336',
  income: '#4CAF50'
};

const AddTransactionScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items: categories, status: categoryStatus } = useSelector((state: RootState) => state.categories);
  const filteredCategories = categories.filter(cat => cat.type === type);

  useEffect(() => {
    if (categoryStatus === 'idle') {
      console.log('Dispatching fetchCategories...');
      dispatch(fetchCategories());
    }
    console.log('Categories from store:', categories);
    console.log('Category status:', categoryStatus);
    console.log('Current type:', type);
  }, [dispatch, categoryStatus]);

  useEffect(() => {
    console.log('Filtered categories for type', type, ':', filteredCategories);
  }, [type, filteredCategories]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredCategories[0]);
    }
  }, [filteredCategories, selectedCategory]);

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const transaction: TransactionRequest = {
        category_id: selectedCategory.id,
        amount: Number(amount),
        type: type,
        date: new Date().toISOString(),
        note: note || undefined
      };
      
      await dispatch(addTransaction(transaction)).unwrap();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加交易失败');
    } finally {
      setIsLoading(false);
    }
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
            onPress={() => {
              setType('expense');
              setSelectedCategory(null);
            }}
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
            onPress={() => {
              setType('income');
              setSelectedCategory(null);
            }}
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
        contentContainerStyle={[
          styles.categoryContent,
          categoryStatus === 'loading' && styles.categoryContentLoading
        ]}
        showsVerticalScrollIndicator={false}
      >
        {categoryStatus === 'loading' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={DEFAULT_CATEGORY_COLOR[type]} size="large" />
          </View>
        ) : (
          <>
            {filteredCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === category.id && { backgroundColor: `${DEFAULT_CATEGORY_COLOR[type]}20` }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${DEFAULT_CATEGORY_COLOR[type]}33` }]}>
                  <Ionicons name={category.icon as any} size={24} color={DEFAULT_CATEGORY_COLOR[type]} />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategory?.id === category.id && { color: DEFAULT_CATEGORY_COLOR[type] }
                ]}>
                  {category.name || `${type === 'income' ? '收入' : '支出'}${category.sort}`}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 保存按钮 */}
      <TouchableOpacity 
        style={[
          styles.saveButton,
          { backgroundColor: type === 'expense' ? '#F44336' : '#4CAF50' },
          (!amount || !selectedCategory || isLoading) && styles.saveButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!amount || !selectedCategory || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>保存</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  categoryContentLoading: {
    minHeight: 200,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#CF66791A',
    borderRadius: 8,
  },
  errorText: {
    color: '#CF6679',
    textAlign: 'center',
  },
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
