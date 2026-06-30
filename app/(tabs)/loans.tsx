import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { getLoans, getLoanTotals, LoanWithBalance } from '@/db/queries/loans';
import { ThemeColors } from '@/constants/colors';
import { LoanType } from '@/types';

const TAB_BAR_HEIGHT = 54;
type FilterKey = 'ALL' | LoanType;

export default function LoansScreen() {
  const c = useThemeColors();
  const { format } = useCurrency();
  const insets = useSafeAreaInsets();

  const [loans, setLoans] = useState<LoanWithBalance[]>([]);
  const [totals, setTotals] = useState({ lent: 0, borrowed: 0 });
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getLoans(), getLoanTotals()])
        .then(([l, t]) => {
          if (!active) return;
          setLoans(l);
          setTotals(t);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const filtered = loans.filter((l) => filter === 'ALL' || l.type === filter);
  const netPosition = totals.lent - totals.borrowed;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 30, color: c.text }}>Loans</Text>
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: c.textMuted, marginTop: 2 }}>
            Money owed & owing
          </Text>
        </View>

        {/* Net position card */}
        <View style={{ marginHorizontal: 24, marginTop: 16, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: netPosition >= 0 ? c.success : c.danger,
              borderRadius: 24,
              padding: 22,
            }}>
            <Text
              style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              Net position
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Bold',
                fontSize: 34,
                lineHeight: 40,
                color: '#fff',
                letterSpacing: -0.5,
                marginBottom: 16,
              }}
              numberOfLines={1}>
              {netPosition >= 0 ? '+' : '−'}
              {format(Math.abs(netPosition))}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 14,
                  padding: 12,
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.8)',
                  }}>
                  You&apos;re owed
                </Text>
                <Text
                  style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: '#fff' }}
                  numberOfLines={1}>
                  {format(totals.lent)}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 14,
                  padding: 12,
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.8)',
                  }}>
                  You owe
                </Text>
                <Text
                  style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: '#fff' }}
                  numberOfLines={1}>
                  {format(totals.borrowed)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filter pills */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 24,
            marginBottom: 20,
            backgroundColor: c.surfaceAlt,
            borderRadius: 14,
            padding: 4,
          }}>
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'LENT', label: 'Lent' },
              { key: 'BORROWED', label: 'Borrowed' },
            ] as { key: FilterKey; label: string }[]
          ).map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.75}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 11,
                alignItems: 'center',
                backgroundColor: filter === f.key ? c.surface : 'transparent',
                borderWidth: filter === f.key ? 1 : 0,
                borderColor: c.border,
              }}>
              <Text
                style={{
                  fontFamily: filter === f.key ? 'Inter-SemiBold' : 'Inter-Regular',
                  fontSize: 13,
                  color: filter === f.key ? c.text : c.textMuted,
                }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator color={c.primary} style={{ marginTop: 48 }} />
          ) : filtered.length === 0 ? (
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: 'center',
                paddingVertical: 56,
              }}>
              <Ionicons name="swap-horizontal-outline" size={36} color={c.textMuted} />
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 16,
                  color: c.text,
                  marginTop: 14,
                }}>
                No loans yet
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 13,
                  color: c.textMuted,
                  marginTop: 4,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}>
                Track money lent or borrowed — no interest, just simple tracking
              </Text>
            </View>
          ) : (
            filtered.map((loan) => <LoanRow key={loan.id} loan={loan} format={format} c={c} />)
          )}
        </ScrollView>

        {/* FAB */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(280)}
          style={{
            position: 'absolute',
            bottom: TAB_BAR_HEIGHT + insets.bottom + 12,
            right: 24,
          }}>
          <TouchableOpacity
            onPress={() => router.push('/add-loan')}
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function LoanRow({
  loan,
  format,
  c,
}: {
  loan: LoanWithBalance;
  format: (n: number) => string;
  c: ThemeColors;
}) {
  const isLent = loan.type === 'LENT';
  const settled = loan.remaining <= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/loan-detail', params: { id: loan.id } })}
      style={{
        backgroundColor: c.surface,
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: c.border,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            marginRight: 12,
            backgroundColor: (isLent ? c.success : c.danger) + '1E',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons
            name={isLent ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={22}
            color={isLent ? c.success : c.danger}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: c.text }}
            numberOfLines={1}>
            {loan.label}
          </Text>
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}
            numberOfLines={1}>
            {isLent ? 'to' : 'from'} {loan.counterparty}
          </Text>
        </View>
        {settled && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: c.success + '1E',
            }}>
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 10, color: c.success }}>
              SETTLED
            </Text>
          </View>
        )}
      </View>

      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: c.textMuted }}>
            {settled ? 'Fully repaid' : 'Remaining'}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 20,
              color: settled ? c.textMuted : c.text,
            }}>
            {format(Math.max(loan.remaining, 0))}
          </Text>
        </View>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
          of {format(loan.original_amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
