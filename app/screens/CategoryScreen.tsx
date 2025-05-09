import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, FAB, IconButton, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { alert } from '../utils/alert';
import type { Category, CategoryRequest, IonIconName } from '../types/category';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/categorySlice';
import type { AppDispatch, RootState } from '../store';

const DEFAULT_ICON: IonIconName = 'wallet-outline';

const CategoryScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, status } = useSelector((state: RootState) => state.categories);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 表单状态
  const [formData, setFormData] = useState<CategoryRequest>({
    name: '',
    type: 'expense',
    icon: DEFAULT_ICON,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredCategories = categories.filter(cat => cat.type === selectedType);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert.show('提示', '请输入分类名称');
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await dispatch(updateCategory({
          id: editingCategory.id,
          data: formData
        })).unwrap();
        alert.show('成功', '分类更新成功');
      } else {
        await dispatch(createCategory(formData)).unwrap();
        alert.show('成功', '分类创建成功');
      }
      handleCloseForm();
    } catch (error) {
      alert.show('错误', editingCategory ? '更新分类失败' : '创建分类失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (category: Category) => {
    alert.confirm('提示', '确定要删除该分类吗？', async () => {
      try {
        setLoading(true);
        await dispatch(deleteCategory(category.id)).unwrap();
        alert.show('成功', '分类删除成功');
      } catch (error) {
        alert.show('错误', '删除分类失败');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || DEFAULT_ICON,
    });
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: selectedType,
      icon: DEFAULT_ICON,
    });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={[styles.categoryItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.categoryInfo}>
        <Ionicons name={item.icon || DEFAULT_ICON} size={24} color={theme.colors.primary} />
        <Text style={[styles.categoryName, { color: theme.colors.onSurface }]}>{item.name}</Text>
      </View>
      <View style={styles.categoryActions}>
        <IconButton
          icon="pencil-outline"
          size={20}
          onPress={() => handleEdit(item)}
          disabled={loading || status === 'loading'}
        />
        <IconButton
          icon="trash-outline"
          size={20}
          iconColor={theme.colors.error}
          onPress={() => handleDelete(item)}
          disabled={loading || status === 'loading'}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button
          mode={selectedType === 'expense' ? 'contained' : 'outlined'}
          onPress={() => setSelectedType('expense')}
          style={styles.typeButton}
          disabled={loading || status === 'loading'}
        >
          支出
        </Button>
        <Button
          mode={selectedType === 'income' ? 'contained' : 'outlined'}
          onPress={() => setSelectedType('income')}
          style={styles.typeButton}
          disabled={loading || status === 'loading'}
        >
          收入
        </Button>
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
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
        disabled={loading || status === 'loading'}
      />

      <Portal>
        <Modal
          visible={showAddForm}
          onDismiss={handleCloseForm}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
            {editingCategory ? '编辑分类' : '添加分类'}
          </Text>
          
          <TextInput
            label="分类名称"
            value={formData.name}
            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
            style={styles.input}
            disabled={loading || status === 'loading'}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleCloseForm}
              style={styles.modalButton}
              disabled={loading || status === 'loading'}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.modalButton}
              loading={loading}
              disabled={loading || status === 'loading'}
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
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  typeButton: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryActions: {
    flexDirection: 'row',
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

export default CategoryScreen;
