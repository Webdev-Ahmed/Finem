import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { getSavingsGoalById, addContribution, deleteSavingsGoal } from '@/db/queries/savings';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { SavingsGoal } from '@/types';

export default function SavingsDetailModal() {
  const c = useThemeColors();
  const { format, currencySymbol } = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSavingsGoalById(Number(id)).then(setGoal).catch(console.error);
  }, [id]);

  const pct = goal && goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0;

  async function handleContribute() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive amount.');
      return;
    }
    setSaving(true);
    try {
      await addContribution(Number(id), num);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not add contribution.');
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert('Delete Goal', `Delete "${goal?.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          await deleteSavingsGoal(Number(id));
          router.back();
        },
      },
    ]);
  }

  if (!goal) return null;

  const remaining = goal.target_amount - goal.current_amount;

  return (
    <ModalSheet
      snapPoint="80%"
      footer={
        <TouchableOpacity
          onPress={handleContribute}
          disabled={amount.length === 0 || saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: amount.length > 0 ? c.primary : c.border,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
            {saving ? 'Saving...' : 'Add to Goal'}
          </Text>
        </TouchableOpacity>
      }>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 6,
          paddingBottom: 14,
        }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={c.text} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: c.text }}>
          {goal.name}
        </Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={12} disabled={deleting}>
          <Ionicons name="trash-outline" size={22} color={c.danger} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={{ backgroundColor: c.primary, borderRadius: 24, padding: 24, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Text style={{ fontSize: 36 }}>{goal.icon}</Text>
            <View>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, color: '#fff' }}>
                {goal.name}
              </Text>
              {goal.deadline && (
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                  {new Date(goal.deadline).toLocaleDateString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              )}
            </View>
          </View>

          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Saved
          </Text>
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 34,
              lineHeight: 40,
              color: '#fff',
              letterSpacing: -0.5,
              marginBottom: 12,
            }}
            numberOfLines={1}>
            {format(goal.current_amount)}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
            <Text
              style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Remaining
            </Text>
            <Text
              style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: 'rgba(255,255,255,0.9)' }}
              numberOfLines={1}>
              {format(remaining)}
            </Text>
          </View>

          <AnimatedProgressBar
            progress={pct}
            color="rgba(255,255,255,0.95)"
            trackColor="rgba(255,255,255,0.25)"
            height={8}
            style={{ marginBottom: 10 }}
          />
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            {(pct * 100).toFixed(1)}% of {format(goal.target_amount)}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 11,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            color: c.textMuted,
            marginBottom: 12,
          }}>
          Add contribution · {currencySymbol}
        </Text>
        <BottomSheetTextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={c.textMuted}
          keyboardType="decimal-pad"
          style={{
            fontFamily: 'Inter-Bold',
            fontSize: 36,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: amount.length > 0 ? c.primary : c.border,
          }}
        />
      </BottomSheetScrollView>
    </ModalSheet>
  );
}
