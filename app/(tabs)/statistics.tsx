import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { ThemeColors } from '@/constants/colors';
import { BarChart } from '@/components/charts/BarChart';
import {
  getLast6MonthsData,
  getCategoryBreakdown,
  MonthlyBar,
  CategoryBreakdown,
} from '@/db/queries/statistics';

type PeriodKey = 'month' | '3months' | '6months';
type ViewType = 'EXPENSE' | 'INCOME';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'month', label: 'This Month' },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' },
];

function getPeriodDates(key: PeriodKey): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  if (key === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (key === '3months') {
    start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }
  return { start: start.toISOString().split('T')[0], end };
}

export default function StatisticsScreen() {
  const c = useThemeColors();
  const { format } = useCurrency();
  const { width } = useWindowDimensions();
  const CHART_W = width - 88;

  const [period, setPeriod] = useState<PeriodKey>('month');
  const [viewType, setViewType] = useState<ViewType>('EXPENSE');
  const [barData, setBarData] = useState<MonthlyBar[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const { start, end } = getPeriodDates(period);
      Promise.all([getLast6MonthsData(), getCategoryBreakdown(start, end, viewType)])
        .then(([bars, cats]) => {
          if (!active) return;
          setBarData(bars);
          setBreakdown(cats);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [period, viewType])
  );

  const total = breakdown.reduce((s, c) => s + c.total, 0);
  const maxCat = breakdown[0]?.total ?? 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 30, color: c.text }}>
              Statistics
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: c.textMuted,
                marginTop: 2,
              }}>
              Spending analysis
            </Text>
          </View>

          {/* Period selector */}
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 24,
              marginTop: 16,
              marginBottom: 24,
              backgroundColor: c.surfaceAlt,
              borderRadius: 14,
              padding: 4,
            }}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPeriod(p.key)}
                activeOpacity={0.75}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 11,
                  alignItems: 'center',
                  backgroundColor: period === p.key ? c.surface : 'transparent',
                  borderWidth: period === p.key ? 1 : 0,
                  borderColor: c.border,
                }}>
                <Text
                  style={{
                    fontFamily: period === p.key ? 'Inter-SemiBold' : 'Inter-Regular',
                    fontSize: 12,
                    color: period === p.key ? c.text : c.textMuted,
                  }}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bar chart card */}
          <View
            style={{
              marginHorizontal: 24,
              marginBottom: 24,
              backgroundColor: c.surface,
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: c.border,
            }}>
            {/* Chart legend */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <LegendDot color={c.success + 'AA'} label="Income" />
              <LegendDot color={c.primary + 'CC'} label="Expense" />
            </View>

            {loading ? (
              <ActivityIndicator color={c.primary} style={{ height: 160 }} />
            ) : (
              <BarChart data={barData} colors={c} width={CHART_W} height={160} />
            )}
          </View>

          {/* View type toggle */}
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 24,
              marginBottom: 20,
              backgroundColor: c.surfaceAlt,
              borderRadius: 14,
              padding: 4,
            }}>
            {(['EXPENSE', 'INCOME'] as ViewType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setViewType(t)}
                activeOpacity={0.75}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 11,
                  alignItems: 'center',
                  backgroundColor:
                    viewType === t ? (t === 'EXPENSE' ? c.danger : c.success) : 'transparent',
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 13,
                    color: viewType === t ? '#fff' : c.textMuted,
                  }}>
                  {t === 'EXPENSE' ? 'Expenses' : 'Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Total */}
          <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: c.textMuted }}>
              Total {viewType === 'EXPENSE' ? 'spent' : 'earned'} ·{' '}
              {PERIODS.find((p) => p.key === period)?.label}
            </Text>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 38, color: c.text, marginTop: 2 }}>
              {format(total)}
            </Text>
          </View>

          {/* Category breakdown */}
          {loading ? (
            <ActivityIndicator color={c.primary} style={{ marginTop: 16 }} />
          ) : breakdown.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: c.text }}>
                No data yet
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  color: c.textMuted,
                  marginTop: 4,
                }}>
                Add transactions to see your breakdown
              </Text>
            </View>
          ) : (
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: c.surface,
                borderRadius: 24,
                padding: 16,
                borderWidth: 1,
                borderColor: c.border,
                gap: 4,
              }}>
              {breakdown.map((cat, i) => (
                <CategoryRow
                  key={cat.category_id}
                  cat={cat}
                  format={format}
                  maxVal={maxCat}
                  total={total}
                  c={c}
                  isLast={i === breakdown.length - 1}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>{label}</Text>
    </View>
  );
}

function CategoryRow({
  cat,
  format,
  maxVal,
  total,
  c,
  isLast,
}: {
  cat: CategoryBreakdown;
  format: (n: number) => string;
  maxVal: number;
  total: number;
  c: ThemeColors;
  isLast: boolean;
}) {
  const pct = total > 0 ? (cat.total / total) * 100 : 0;
  const barPct = maxVal > 0 ? cat.total / maxVal : 0;

  return (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: c.border,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: cat.category_color + '22',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
          <Text style={{ fontSize: 18 }}>{cat.category_icon}</Text>
        </View>
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: c.text, flex: 1 }}>
          {cat.category_name}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: c.text }}>
            {format(cat.total)}
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: c.textMuted }}>
            {pct.toFixed(1)}%
          </Text>
        </View>
      </View>
      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: c.border, borderRadius: 2 }}>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            width: `${barPct * 100}%` as any,
            backgroundColor: cat.category_color,
          }}
        />
      </View>
    </View>
  );
}
