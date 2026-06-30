import { CategoryType } from '@/types';

interface SeedCategory {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { name: 'Salary',        icon: '💼', color: '#34C759', type: 'INCOME' },
  { name: 'Freelance',     icon: '💻', color: '#007AFF', type: 'INCOME' },
  { name: 'Investment',    icon: '📈', color: '#00C7BE', type: 'INCOME' },
  { name: 'Gift',          icon: '🎁', color: '#FF9500', type: 'INCOME' },
  { name: 'Other Income',  icon: '💰', color: '#9A9A6E', type: 'INCOME' },
  { name: 'Food',          icon: '🍔', color: '#E84520', type: 'EXPENSE' },
  { name: 'Transport',     icon: '🚗', color: '#FF9500', type: 'EXPENSE' },
  { name: 'Shopping',      icon: '🛍️', color: '#F2A0C4', type: 'EXPENSE' },
  { name: 'Health',        icon: '💊', color: '#34C759', type: 'EXPENSE' },
  { name: 'Entertainment', icon: '🎬', color: '#A05048', type: 'EXPENSE' },
  { name: 'Bills',         icon: '📄', color: '#9A9A6E', type: 'EXPENSE' },
  { name: 'Education',     icon: '📚', color: '#5856D6', type: 'EXPENSE' },
  { name: 'Travel',        icon: '✈️', color: '#007AFF', type: 'EXPENSE' },
  { name: 'Other',         icon: '📦', color: '#8A8A8A', type: 'EXPENSE' },
];
