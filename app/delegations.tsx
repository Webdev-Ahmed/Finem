import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { getActiveDelegations, DelegationWithPeriod } from '@/db/queries/delegations';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { ThemeColors } from '@/constants/colors';

const PERIOD_LABELS: Record<string, string> = {
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
  ONE_TIME: 'One-time',
};

export default function DelegationsScreen() {
  const c = useThemeColors();
  const { format } = useCurrency();
  const insets = useSafeAreaInsets();
  const [delegations, setDelegations] = useState<DelegationWithPeriod[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getActiveDelegations()
        .then((d) => {
          if (active) setDelegations(d);
        })
        .catch(console.error);
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: c.text }}>Delegations</Text>
          <TouchableOpacity onPress={() => router.push('/add-delegation')} hitSlop={12}>
            <Ionicons name="add" size={26} color={c.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}>
          {delegations.length === 0 ? (
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: 'center',
                paddingVertical: 56,
                marginTop: 8,
              }}>
              <Ionicons name="layers-outline" size={36} color={c.textMuted} />
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 16,
                  color: c.text,
                  marginTop: 14,
                }}>
                No delegations yet
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
                Create budget envelopes to allocate money toward specific purposes
              </Text>
            </View>
          ) : (
            delegations.map((d) => <DelegationCard key={d.id} item={d} format={format} c={c} />)
          )}
        </ScrollView>
      </SafeAreaView>
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
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/delegation-detail', params: { id: item.id } })}
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
            backgroundColor: item.color + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: c.text }}
            numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
            {PERIOD_LABELS[item.period_type]}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
      </View>

      <Text
        style={{
          fontFamily: 'Inter-Bold',
          fontSize: 22,
          color: over ? c.danger : c.text,
          marginBottom: 2,
        }}>
        {format(Math.abs(remaining))}
        {over ? ' over' : ' left'}
      </Text>
      <Text
        style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted, marginBottom: 12 }}>
        of {format(item.budgeted_amount)}
      </Text>
      <AnimatedProgressBar
        progress={pct}
        color={over ? c.danger : item.color}
        trackColor={c.border}
        height={6}
      />
    </TouchableOpacity>
  );
}
