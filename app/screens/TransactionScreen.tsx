import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, useTheme, FAB, TextInput, Button, Portal, Modal, SegmentedButtons } from 'react-native-paper';
import { format } from 'date-fns';
import { alert } from '../utils/alert';
import type { Category } from '../types/category';
import type { TransactionWithCategory, TransactionRequest } from '../types/transaction';
import transactionService from '../services/transaction';
import categoryService from '../services/category';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';

const TransactionScreen = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);

  // 表单状态
  const [formData, setFormData] = useState<TransactionRequest>({
    type: 'expense',
    category_id: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (error) {
      alert.show('错误', '获取记账记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      alert.show('错误', '获取分类列表失败');
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [loadTransactions, loadCategories]);

  const handleSubmit = async () => {
    if (!formData.category_id) {
      alert.show('提示', '请选择分类');
      return;
    }

    if (!formData.amount) {
      alert.show('提示', '请输入金额');
      return;
    }

    try {
      setLoading(true);
      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction.id, formData);
        alert.show('成功', '记录更新成功');
      } else {
        await transactionService.createTransaction(formData);
        alert.show('成功', '记录创建成功');
      }
      await loadTransactions();
      handleCloseForm();
    } catch (error) {
      alert.show('错误', editingTransaction ? '更新记录失败' : '创建记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction: TransactionWithCategory) => {
    alert.confirm('提示', '确定要删除该记录吗？', async () => {
      try {
        setLoading(true);
        await transactionService.deleteTransaction(transaction.id);
        await loadTransactions();
        alert.show('成功', '记录删除成功');
      } catch (error) {
        alert.show('错误', '删除记录失败');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category_id: transaction.category_id,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note || '',
    });
    setSelectedType(transaction.type);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingTransaction(null);
    setFormData({
      type: selectedType,
      category_id: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const renderCategorySelect = () => {
    const filteredCategories = categories.filter(cat => cat.type === selectedType);
    
    return (
      <View style={styles.categories}>
        {filteredCategories.map(category => (
          <Button
            key={category.id}
            mode={formData.category_id === category.id ? 'contained' : 'outlined'}
            onPress={() => setFormData(prev => ({ ...prev, category_id: category.id }))}
            style={styles.categoryButton}
            disabled={loading}
          >
            <Icon name={category.icon} size={16} />
            <Text> {category.name}</Text>
          </Button>
        ))}
      </View>
    );
  };

  const renderTransaction = ({ item }: { item: TransactionWithCategory }) => (
    <View style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.transactionInfo}>
        <Icon 
          name={item.category.icon} 
          size={24} 
          color={theme.colors.primary} 
        />
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionCategory, { color: theme.colors.onSurface }]}>
            {item.category.name}
          </Text>
          <Text style={[styles.transactionNote, { color: theme.colors.onSurfaceDisabled }]}>
            {item.note || format(new Date(item.date), 'yyyy-MM-dd')}
          </Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'expense' ? theme.colors.error : theme.colors.primary }
        ]}>
          {item.type === 'expense' ? '-' : '+'}{item.amount}
        </Text>
      </View>
      
      <View style={styles.transactionActions}>
        <IconButton
          icon="pencil-outline"
          size={20}
          onPress={() => handleEdit(item)}
        />
        <IconButton
          icon="trash-outline"
          size={20}
          color={theme.colors.error}
          onPress={() => handleDelete(item)}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <SegmentedButtons
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value as 'income' | 'expense');
            setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }));
          }}
          buttons={[
            { value: 'expense', label: '支出' },
            { value: 'income', label: '收入' },
          ]}
        />
      </View>

      <FlatList
        data={transactions.filter(t => t.type === selectedType)}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {
          setFormData(prev => ({ ...prev, type: selectedType }));
          setShowAddForm(true);
        }}
        disabled={loading}
      />

      <Portal>
        <Modal
          visible={showAddForm}
          onDismiss={handleCloseForm}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
            {editingTransaction ? '编辑记录' : '添加记录'}
          </Text>

          {renderCategorySelect()}
          
          <TextInput
            label="金额"
            value={formData.amount.toString()}
            onChangeText={text => {
              const amount = parseFloat(text) || 0;
              setFormData(prev => ({ ...prev, amount }));
            }}
            keyboardType="numeric"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="备注"
            value={formData.note}
            onChangeText={text => setFormData(prev => ({ ...prev, note: text }))}
            style={styles.input}
            disabled={loading}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleCloseForm}
              style={styles.modalButton}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.modalButton}
              loading={loading}
              disabled={loading}
            >
              确定
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  list: {
    padding: 16,
  },
  transactionItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionNote: {
    fontSize: 14,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    minWidth: 80,
  },
  input: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default TransactionScreen;
