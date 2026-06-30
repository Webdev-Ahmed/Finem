import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getCategories, deleteCategory } from '@/db/queries/categories';
import { Category } from '@/types';
import { ThemeColors } from '@/constants/colors';

export default function CategoriesScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getCategories()
        .then((cats) => {
          if (active) setCategories(cats);
        })
        .catch(console.error);
      return () => {
        active = false;
      };
    }, [])
  );

  function handleDelete(cat: Category) {
    Alert.alert(
      'Delete Category',
      `Delete "${cat.name}"? Transactions using it will keep their record but lose this label.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(cat.id);
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          },
        },
      ]
    );
  }

  const expense = categories.filter((c) => c.type === 'EXPENSE');
  const income = categories.filter((c) => c.type === 'INCOME');

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 16,
          }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: c.text }}>Categories</Text>
          <TouchableOpacity onPress={() => router.push('/add-category')} hitSlop={12}>
            <Ionicons name="add" size={26} color={c.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}>
          <CategoryGroup title="Expense" data={expense} onDelete={handleDelete} c={c} />
          <CategoryGroup title="Income" data={income} onDelete={handleDelete} c={c} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CategoryGroup({
  title,
  data,
  onDelete,
  c,
}: {
  title: string;
  data: Category[];
  onDelete: (cat: Category) => void;
  c: ThemeColors;
}) {
  if (data.length === 0) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      <Text
        style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          letterSpacing: 1.3,
          textTransform: 'uppercase',
          color: c.textMuted,
          marginBottom: 10,
        }}>
        {title}
      </Text>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: c.border,
          overflow: 'hidden',
        }}>
        {data.map((cat, i) => (
          <View
            key={cat.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              borderBottomWidth: i === data.length - 1 ? 0 : 1,
              borderBottomColor: c.border,
            }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                marginRight: 12,
                backgroundColor: cat.color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 19 }}>{cat.icon}</Text>
            </View>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: c.text, flex: 1 }}>
              {cat.name}
            </Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/add-category', params: { id: cat.id } })}
              hitSlop={10}
              style={{ marginRight: 16 }}>
              <Ionicons name="pencil-outline" size={18} color={c.textMuted} />
            </TouchableOpacity>
            {!cat.is_default && (
              <TouchableOpacity onPress={() => onDelete(cat)} hitSlop={10}>
                <Ionicons name="trash-outline" size={18} color={c.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
