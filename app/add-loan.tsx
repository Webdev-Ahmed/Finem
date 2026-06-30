import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { insertLoan } from '@/db/queries/loans';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { LoanType } from '@/types';

export default function AddLoanModal() {
  const c = useThemeColors();
  const { currencySymbol } = useCurrency();

  const [type, setType] = useState<LoanType>('LENT');
  const [label, setLabel] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const canSave =
    label.trim().length > 0 && counterparty.trim().length > 0 && parseFloat(amount) > 0;

  async function handleSave() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid positive amount.');
      return;
    }
    setSaving(true);
    try {
      await insertLoan(
        label.trim(),
        counterparty.trim(),
        type,
        num,
        today,
        note.trim() || undefined
      );
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save loan. Try again.');
      setSaving(false);
    }
  }

  return (
    <ModalSheet
      snapPoint="88%"
      footer={
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: canSave ? c.primary : c.border,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
            {saving ? 'Saving...' : 'Save Loan'}
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
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: c.text }}>New Loan</Text>
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
        {(['LENT', 'BORROWED'] as LoanType[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            activeOpacity={0.75}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 11,
              alignItems: 'center',
              backgroundColor: type === t ? (t === 'LENT' ? c.success : c.danger) : 'transparent',
            }}>
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 14,
                color: type === t ? '#fff' : c.textMuted,
              }}>
              {t === 'LENT' ? '↑ I lent money' : '↓ I borrowed money'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Label text="Label" />
        <BottomSheetTextInput
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Car repair, Rent help"
          placeholderTextColor={c.textMuted}
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 17,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: label.length > 0 ? c.primary : c.border,
            marginBottom: 24,
          }}
        />

        <Label text={type === 'LENT' ? 'Lent to' : 'Borrowed from'} />
        <BottomSheetTextInput
          value={counterparty}
          onChangeText={setCounterparty}
          placeholder="e.g. Sarah, John"
          placeholderTextColor={c.textMuted}
          autoCapitalize="words"
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 17,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: counterparty.length > 0 ? c.primary : c.border,
            marginBottom: 24,
          }}
        />

        <Label text={`Amount · ${currencySymbol}`} />
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
            marginBottom: 24,
          }}
        />

        <Label text="Note (optional)" />
        <BottomSheetTextInput
          value={note}
          onChangeText={setNote}
          placeholder="Any details worth remembering"
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
