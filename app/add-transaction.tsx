import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { getCategories } from '@/db/queries/categories';
import { getActiveDelegations, DelegationWithPeriod } from '@/db/queries/delegations';
import { insertTransaction } from '@/db/queries/transactions';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { Category, TransactionType } from '@/types';

export default function AddTransactionModal() {
  const c = useThemeColors();
  const { currencySymbol } = useCurrency();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [delegations, setDelegations] = useState<DelegationWithPeriod[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDelegation, setSelectedDelegation] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      getCategories(type),
      type === 'EXPENSE' ? getActiveDelegations() : Promise.resolve([]),
    ])
      .then(([cats, dels]) => {
        setCategories(cats);
        setDelegations(dels as DelegationWithPeriod[]);
        setSelectedCategory(null);
        setSelectedDelegation(null);
      })
      .catch(console.error);
  }, [type]);

  async function handleSave() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid positive amount.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('No category', 'Please select a category.');
      return;
    }
    setSaving(true);
    try {
      await insertTransaction(
        num,
        type,
        selectedCategory,
        today,
        note.trim() || undefined,
        selectedDelegation ?? undefined
      );
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save the transaction. Try again.');
      setSaving(false);
    }
  }

  const canSave = amount.length > 0 && selectedCategory !== null && !saving;

  return (
    <ModalSheet snapPoint="90%">
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
          Add Transaction
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Type toggle */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 24,
          marginBottom: 20,
          backgroundColor: c.surfaceAlt,
          borderRadius: 14,
          padding: 4,
        }}>
        {(['EXPENSE', 'INCOME'] as TransactionType[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            activeOpacity={0.75}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 11,
              alignItems: 'center',
              backgroundColor:
                type === t ? (t === 'EXPENSE' ? c.danger : c.success) : 'transparent',
            }}>
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 14,
                color: type === t ? '#fff' : c.textMuted,
              }}>
              {t === 'EXPENSE' ? '↑ Expense' : '↓ Income'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Amount */}
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1.5,
            borderColor: amount.length > 0 ? c.primary : c.border,
          }}>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              color: c.textMuted,
              marginBottom: 6,
            }}>
            Amount · {currencySymbol}
          </Text>
          <BottomSheetTextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={c.textMuted}
            keyboardType="decimal-pad"
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 42,
              color: c.text,
              padding: 0,
            }}
          />
        </View>

        {/* Category */}
        <Label text="Category" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {categories.map((cat) => {
            const on = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  backgroundColor: on ? cat.color + '1E' : c.surface,
                  borderColor: on ? cat.color : c.border,
                }}>
                <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                <Text
                  style={{
                    fontFamily: on ? 'Inter-SemiBold' : 'Inter-Regular',
                    fontSize: 13,
                    color: on ? cat.color : c.text,
                  }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Delegation */}
        {type === 'EXPENSE' && delegations.length > 0 && (
          <>
            <Label text="Delegation (optional)" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {delegations.map((del) => {
                const on = selectedDelegation === del.period_id;
                return (
                  <TouchableOpacity
                    key={del.id}
                    onPress={() => setSelectedDelegation(on ? null : del.period_id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      backgroundColor: on ? del.color + '1E' : c.surface,
                      borderColor: on ? del.color : c.border,
                    }}>
                    <Text style={{ fontSize: 16 }}>{del.icon}</Text>
                    <Text
                      style={{
                        fontFamily: on ? 'Inter-SemiBold' : 'Inter-Regular',
                        fontSize: 13,
                        color: on ? del.color : c.text,
                      }}>
                      {del.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Note */}
        <Label text="Note (optional)" />
        <BottomSheetTextInput
          value={note}
          onChangeText={setNote}
          placeholder="What's this for?"
          placeholderTextColor={c.textMuted}
          multiline
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 16,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
            minHeight: 80,
            textAlignVertical: 'top',
          }}
        />
      </BottomSheetScrollView>

      {/* Save */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.85}
          style={{
            backgroundColor: canSave ? c.primary : c.border,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
            {saving ? 'Saving...' : 'Save Transaction'}
          </Text>
        </TouchableOpacity>
      </View>
    </ModalSheet>
  );
}

function Label({ text }: { text: string }) {
  const c = useThemeColors();
  return (
    <Text
      style={{
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        letterSpacing: 1.3,
        textTransform: 'uppercase',
        color: c.textMuted,
        marginBottom: 12,
      }}>
      {text}
    </Text>
  );
}
