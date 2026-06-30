import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useApp } from '@/context/AppContext';
import { useCurrency } from '@/hooks/useCurrency';
import {
  getMonthlyTotals,
  getRecentTransactions,
  TransactionWithCategory,
} from '@/db/queries/transactions';
import { getActiveDelegations, DelegationWithPeriod } from '@/db/queries/delegations';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { ThemeColors } from '@/constants/colors';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const TAB_BAR_HEIGHT = 54;

export default function HomeScreen() {
  const c = useThemeColors();
  const { userName } = useApp();
  const { format, currencyCode } = useCurrency();
  const insets = useSafeAreaInsets();

  const [displayDate] = useState(() => new Date());
  const monthLabel = MONTHS[displayDate.getMonth()];

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [delegations, setDelegations] = useState<DelegationWithPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const today = new Date();
      Promise.all([
        getMonthlyTotals(today.getFullYear(), today.getMonth() + 1),
        getRecentTransactions(5),
        getActiveDelegations(),
      ])
        .then(([totals, tx, dels]) => {
          if (!active) return;
          setIncome(totals.income);
          setExpense(totals.expense);
          setTransactions(tx);
          setDelegations(dels);
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

  const net = income - expense;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 8,
          }}>
          {/* Simple name pill — no icon, matches reference designs */}
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
            }}>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: c.text }}>
              {userName || 'You'}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: c.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: c.border,
            }}>
            <Ionicons name="notifications-outline" size={19} color={c.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Balance hero — only this section animates in */}
          <Animated.View
            entering={FadeIn.duration(300)}
            style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: c.textMuted,
                marginBottom: 4,
              }}>
              left in {monthLabel.toLowerCase()}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 10,
                marginBottom: 4,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Bold',
                  fontSize: 52,
                  lineHeight: 60,
                  color: net < 0 ? c.danger : c.text,
                }}>
                {format(Math.abs(net))}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  color: c.textMuted,
                  paddingBottom: 10,
                }}>
                {currencyCode}
              </Text>
            </View>
          </Animated.View>

          {/* Tri-color strip */}
          <View style={{ marginHorizontal: 24, marginTop: 4, marginBottom: 32 }}>
            <View
              style={{ flexDirection: 'row', borderRadius: 20, overflow: 'hidden', height: 90 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: c.cardPink,
                  padding: 14,
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#fff' }}
                  numberOfLines={1}>
                  {format(expense)}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.72)',
                  }}>
                  spent
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: c.cardTerra,
                  padding: 14,
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#fff' }}
                  numberOfLines={1}>
                  {format(income)}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.72)',
                  }}>
                  income
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: c.primary,
                  padding: 14,
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#fff' }}
                  numberOfLines={1}>
                  {format(Math.abs(net))}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.72)',
                  }}>
                  {net >= 0 ? 'saved' : 'deficit'}
                </Text>
              </View>
            </View>
          </View>

          {/* Delegations */}
          {delegations.length > 0 && (
            <>
              <SectionHeader title="Delegations" sub="budget allocation" c={c} />
              <FlatList
                data={delegations}
                horizontal
                keyExtractor={(d) => String(d.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                style={{ marginBottom: 32 }}
                renderItem={({ item }) => <DelegationCard item={item} format={format} c={c} />}
              />
            </>
          )}

          {/* Activity */}
          <SectionHeader title="Activity" sub="recent transactions" c={c} />
          {loading ? (
            <ActivityIndicator color={c.primary} style={{ marginTop: 32 }} />
          ) : transactions.length === 0 ? (
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: c.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: 'center',
                paddingVertical: 40,
              }}>
              <Ionicons name="receipt-outline" size={36} color={c.textMuted} />
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 16,
                  color: c.text,
                  marginTop: 12,
                }}>
                No transactions yet
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 13,
                  color: c.textMuted,
                  marginTop: 4,
                }}>
                Tap + to record your first one
              </Text>
            </View>
          ) : (
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: c.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: c.border,
                overflow: 'hidden',
              }}>
              {transactions.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  format={format}
                  c={c}
                  isLast={i === transactions.length - 1}
                />
              ))}
            </View>
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
            onPress={() => router.push('/add-transaction')}
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title, sub, c }: { title: string; sub: string; c: ThemeColors }) {
  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 26, color: c.text }}>{title}</Text>
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: c.textMuted, marginTop: 2 }}>
        {sub}
      </Text>
    </View>
  );
}

function DelegationCard({
  item,
  format,
  c,
}: {
  item: DelegationWithPeriod;
  format: (n: number) => string;
  c: ThemeColors;
}) {
  const remaining = item.budgeted_amount - item.spent;
  const pct = item.budgeted_amount > 0 ? item.spent / item.budgeted_amount : 0;
  const over = remaining < 0;

  return (
    <View
      style={{
        width: 170,
        borderRadius: 20,
        padding: 18,
        backgroundColor: item.color + '18',
        borderWidth: 1.5,
        borderColor: item.color + '55',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Text style={{ fontSize: 22 }}>{item.icon}</Text>
        <Text
          style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: c.text, flex: 1 }}
          numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, color: over ? c.danger : c.text }}>
        {format(Math.abs(remaining))}
        {over ? ' over' : ''}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter-Regular',
          fontSize: 12,
          color: c.textMuted,
          marginBottom: 12,
          marginTop: 2,
        }}>
        of {format(item.budgeted_amount)}
      </Text>
      <AnimatedProgressBar
        progress={pct}
        color={over ? c.danger : item.color}
        trackColor={c.border}
        height={5}
      />
    </View>
  );
}

function TransactionRow({
  tx,
  format,
  c,
  isLast,
}: {
  tx: TransactionWithCategory;
  format: (n: number) => string;
  c: ThemeColors;
  isLast: boolean;
}) {
  const isIncome = tx.type === 'INCOME';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: c.border,
      }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          marginRight: 14,
          backgroundColor: tx.category_color + '22',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontSize: 21 }}>{tx.category_icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: c.text }}>
          {tx.category_name}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 12,
            color: c.textMuted,
          }}
          numberOfLines={1}>
          {tx.note ?? tx.date}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 15,
          color: isIncome ? c.success : c.danger,
        }}>
        {isIncome ? '+' : '−'}
        {format(tx.amount)}
      </Text>
    </View>
  );
}
