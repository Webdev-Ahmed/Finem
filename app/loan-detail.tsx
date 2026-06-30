import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import {
  getLoanById,
  getRepayments,
  addRepayment,
  deleteLoan,
  LoanWithBalance,
} from '@/db/queries/loans';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { LoanRepayment } from '@/types';

export default function LoanDetailModal() {
  const c = useThemeColors();
  const { format, currencySymbol } = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loan, setLoan] = useState<LoanWithBalance | null>(null);
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!id) return;
      Promise.all([getLoanById(Number(id)), getRepayments(Number(id))])
        .then(([l, r]) => {
          if (active) {
            setLoan(l);
            setRepayments(r);
          }
        })
        .catch(console.error);
      return () => {
        active = false;
      };
    }, [id])
  );

  if (!loan) return null;

  const isLent = loan.type === 'LENT';
  const settled = loan.remaining <= 0;
  const pct = loan.original_amount > 0 ? loan.total_repaid / loan.original_amount : 0;

  async function handleAddRepayment() {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive amount.');
      return;
    }
    if (num > loan!.remaining) {
      Alert.alert('Amount too high', `Remaining balance is ${format(loan!.remaining)}.`);
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await addRepayment(Number(id), num, today);
      setAmount('');
      const [l, r] = await Promise.all([getLoanById(Number(id)), getRepayments(Number(id))]);
      setLoan(l);
      setRepayments(r);
    } catch {
      Alert.alert('Error', 'Could not record repayment.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Loan',
      `Delete "${loan?.label}" and all its repayment history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await deleteLoan(Number(id));
            router.back();
          },
        },
      ]
    );
  }

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
        <Text
          style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: c.text }}
          numberOfLines={1}>
          {loan.label}
        </Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={12} disabled={deleting}>
          <Ionicons name="trash-outline" size={22} color={c.danger} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: isLent ? c.success : c.danger,
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Ionicons
              name={isLent ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={28}
              color="#fff"
            />
            <View>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: '#fff' }}>
                {isLent ? `Lent to ${loan.counterparty}` : `Borrowed from ${loan.counterparty}`}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.75)',
                }}>
                {new Date(loan.date).toLocaleDateString('default', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            {settled ? 'Fully repaid' : 'Remaining balance'}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 34,
              lineHeight: 40,
              color: '#fff',
              letterSpacing: -0.5,
              marginBottom: 14,
            }}
            numberOfLines={1}>
            {format(Math.max(loan.remaining, 0))}
          </Text>

          <AnimatedProgressBar
            progress={pct}
            color="rgba(255,255,255,0.95)"
            trackColor="rgba(255,255,255,0.25)"
            height={8}
            style={{ marginBottom: 10 }}
          />
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            {format(loan.total_repaid)} repaid of {format(loan.original_amount)}
          </Text>

          {loan.note && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.85)',
                }}>
                {loan.note}
              </Text>
            </View>
          )}
        </View>

        {!settled && (
          <>
            <Label text={`Record repayment · ${currencySymbol}`} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
              <BottomSheetTextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={c.textMuted}
                keyboardType="decimal-pad"
                style={{
                  flex: 1,
                  fontFamily: 'Inter-Bold',
                  fontSize: 24,
                  color: c.text,
                  backgroundColor: c.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1.5,
                  borderColor: amount.length > 0 ? c.primary : c.border,
                }}
              />
              <TouchableOpacity
                onPress={handleAddRepayment}
                disabled={amount.length === 0 || saving}
                activeOpacity={0.85}
                style={{
                  paddingHorizontal: 20,
                  backgroundColor: amount.length > 0 ? c.primary : c.border,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#fff' }}>
                  {saving ? '...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Label text="Repayment History" />
        {repayments.length === 0 ? (
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: c.border,
              alignItems: 'center',
              paddingVertical: 32,
            }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: c.textMuted }}>
              No repayments recorded yet
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
            }}>
            {repayments.map((r, i) => (
              <View
                key={r.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: i === repayments.length - 1 ? 0 : 1,
                  borderBottomColor: c.border,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: c.success + '1E',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons name="checkmark" size={16} color={c.success} />
                  </View>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: c.textMuted }}>
                    {new Date(r.date).toLocaleDateString('default', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: c.text }}>
                  {format(r.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
