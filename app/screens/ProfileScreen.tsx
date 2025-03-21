import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const MENU_ITEMS = [
  { id: 1, title: '消费预算', icon: 'wallet-outline' },
  { id: 2, title: '支出分类', icon: 'list-outline' },
  { id: 3, title: '收入分类', icon: 'cash-outline' },
  { id: 4, title: '消息通知', icon: 'notifications-outline' },
  { id: 5, title: '主题设置', icon: 'color-palette-outline' },
  { id: 6, title: '关于我们', icon: 'information-circle-outline' },
];

const ProfileScreen = () => {
  const theme = useTheme();

  const renderMenuItem = ({ id, title, icon }) => (
    <TouchableOpacity
      key={id}
      style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 用户信息 */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#FFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>用户昵称</Text>
          <Text style={styles.userDesc}>记录美好生活</Text>
        </View>
      </View>

      {/* 菜单列表 */}
      <View style={styles.menuList}>
        {MENU_ITEMS.map(renderMenuItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuList: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 1,
  },
  menuIcon: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
  },
});

export default ProfileScreen;
