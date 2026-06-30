import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DEFAULT_CATEGORIES } from '@/db/seeds';
import { insertCategory } from '@/db/queries/categories';
import { setSetting } from '@/db/queries/settings';
import { useThemeColors } from '@/hooks/useThemeColors';

const ITEM_GAP = 10;
const H_PAD = 32;
const ITEM_WIDTH = (Dimensions.get('window').width - H_PAD * 2 - ITEM_GAP) / 2;

export default function OnboardingStep3() {
  const c = useThemeColors();
  // Pre-select all categories
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(DEFAULT_CATEGORIES.map((_, i) => i)),
  );
  const [loading, setLoading] = useState(false);

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  async function handleDone() {
    if (selected.size === 0 || loading) return;
    setLoading(true);
    try {
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        if (!selected.has(i)) continue;
        const cat = DEFAULT_CATEGORIES[i];
        await insertCategory(cat.name, cat.icon, cat.color, cat.type, true);
      }
      await setSetting('onboarding_done', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Onboarding step-3 error:', e);
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={{ paddingHorizontal: H_PAD, paddingTop: 52, paddingBottom: 28 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 42, lineHeight: 48, color: c.text }}>
            {'Your\ncategories.'}
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: c.textMuted, marginTop: 10 }}>
            Pick what fits your life. Add more anytime.
          </Text>
        </View>

        {/* Grid */}
        <FlatList
          data={DEFAULT_CATEGORIES}
          keyExtractor={(_, i) => String(i)}
          numColumns={2}
          columnWrapperStyle={{ gap: ITEM_GAP, paddingHorizontal: H_PAD }}
          contentContainerStyle={{ gap: ITEM_GAP, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const on = selected.has(index);
            return (
              <TouchableOpacity
                onPress={() => toggle(index)}
                activeOpacity={0.72}
                style={{
                  width: ITEM_WIDTH,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  backgroundColor: on ? item.color + '18' : c.surface,
                  borderColor: on ? item.color : c.border,
                }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 11,
                  backgroundColor: item.color + '28',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: on ? 'Inter-SemiBold' : 'Inter-Regular',
                    fontSize: 13,
                    color: on ? item.color : c.text,
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                    color: c.textMuted,
                    marginTop: 1,
                  }}>
                    {item.type === 'INCOME' ? 'Income' : 'Expense'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Done */}
        <View style={{ paddingHorizontal: H_PAD, paddingTop: 12, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleDone}
            disabled={selected.size === 0 || loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: selected.size > 0 ? c.primary : c.border,
              borderRadius: 16,
              padding: 18,
              alignItems: 'center',
            }}>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
              {loading ? 'Setting up...' : `Done  ·  ${selected.size} selected →`}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}
