// API URL
export const API_URL = 'http://localhost:8028/api/v1';

// Transaction Categories
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: 'food' },
  { id: 'shopping', name: '购物', icon: 'shopping' },
  { id: 'transportation', name: '交通', icon: 'car' },
  { id: 'entertainment', name: '娱乐', icon: 'movie' },
  { id: 'housing', name: '住房', icon: 'home' },
  { id: 'utilities', name: '水电煤', icon: 'flash' },
  { id: 'health', name: '医疗健康', icon: 'medical-bag' },
  { id: 'education', name: '教育', icon: 'school' },
  { id: 'travel', name: '旅行', icon: 'airplane' },
  { id: 'other', name: '其他', icon: 'dots-horizontal' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: '工资', icon: 'cash' },
  { id: 'bonus', name: '奖金', icon: 'gift' },
  { id: 'investment', name: '投资', icon: 'chart-line' },
  { id: 'refund', name: '退款', icon: 'cash-refund' },
  { id: 'other', name: '其他', icon: 'dots-horizontal' },
];

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
};

// API 配置
export const APP_NAME = 'NoteAI';
export const APP_VERSION = '1.0.0';
