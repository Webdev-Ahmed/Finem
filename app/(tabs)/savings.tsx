import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { getSavingsGoals } from '@/db/queries/savings';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { SavingsGoal } from '@/types';

const TAB_BAR_HEIGHT = 54;

const GOAL_COLORS = ['#E84520', '#A05048', '#9A9A6E', '#F2A0C4'];
const GOAL_TEXT_COLORS = ['#fff', '#fff', '#fff', '#1C1C1E'];

export default function SavingsScreen() {
  const c = useThemeColors();
  const { format } = useCurrency();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSavingsGoals()
        .then((g) => {
          if (active) {
            setGoals(g);
            setLoading(false);
          }
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

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const overallPct = totalTarget > 0 ? totalSaved / totalTarget : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <AnimatedCard index={0} style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 30, color: c.text }}>Savings</Text>
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: c.textMuted, marginTop: 2 }}>
            Your goals
          </Text>
        </AnimatedCard>

        {/* Overall progress card */}
        {goals.length > 0 && (
          <AnimatedCard index={1} style={{ marginHorizontal: 24, marginTop: 16, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: c.border,
              }}>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
                Total saved
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Bold',
                  fontSize: 36,
                  lineHeight: 42,
                  color: c.text,
                  letterSpacing: -0.5,
                  marginBottom: 14,
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {format(totalSaved)}
              </Text>

              <View
                style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
                  of
                </Text>
                <Text
                  style={{ fontFamily: 'Inter-SemiBold', fontSize: 18, color: c.textMuted }}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {format(totalTarget)}
                </Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
                  target
                </Text>
              </View>

              <AnimatedProgressBar
                progress={overallPct}
                color={c.primary}
                trackColor={c.border}
                height={8}
              />
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 12,
                  color: c.textMuted,
                  marginTop: 8,
                }}>
                {(overallPct * 100).toFixed(1)}% of total goal reached
              </Text>
            </View>
          </AnimatedCard>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator color={c.primary} style={{ marginTop: 48 }} />
          ) : goals.length === 0 ? (
            <AnimatedCard index={1}>
              <View
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: 'center',
                  paddingVertical: 56,
                }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: c.text }}>
                  No goals yet
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    color: c.textMuted,
                    marginTop: 6,
                    textAlign: 'center',
                    paddingHorizontal: 32,
                  }}>
                  Set a savings goal and start building your future
                </Text>
              </View>
            </AnimatedCard>
          ) : (
            goals.map((goal, i) => {
              const bgColor = GOAL_COLORS[i % GOAL_COLORS.length];
              const textColor = GOAL_TEXT_COLORS[i % GOAL_TEXT_COLORS.length];
              const pct = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0;
              const deadline = goal.deadline
                ? new Date(goal.deadline).toLocaleDateString('default', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'No deadline';

              return (
                <AnimatedCard key={goal.id} index={i + 2} style={{ marginBottom: 16 }}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() =>
                      router.push({
                        pathname: '/savings-detail',
                        params: { id: goal.id },
                      })
                    }
                    style={{ backgroundColor: bgColor, borderRadius: 24, padding: 24 }}>
                    {/* Top row */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 24,
                      }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 28,
                            color: textColor,
                            lineHeight: 32,
                          }}>
                          {goal.name}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: textColor + 'BB',
                            marginTop: 4,
                          }}>
                          {deadline}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text style={{ fontSize: 22 }}>{goal.icon}</Text>
                      </View>
                    </View>

                    {/* Amount */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 20,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Bold',
                          fontSize: 38,
                          color: textColor,
                          lineHeight: 44,
                        }}>
                        {format(goal.current_amount)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          fontSize: 16,
                          color: textColor + '80',
                        }}>
                        / {format(goal.target_amount)}
                      </Text>
                    </View>

                    {/* Progress */}
                    <AnimatedProgressBar
                      progress={pct}
                      color={`rgba(255,255,255,0.9)`}
                      trackColor={`rgba(255,255,255,0.25)`}
                      height={6}
                      style={{ marginBottom: 10 }}
                    />
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 13,
                        color: textColor + 'AA',
                      }}>
                      {(pct * 100).toFixed(1)}% completed
                    </Text>
                  </TouchableOpacity>
                </AnimatedCard>
              );
            })
          )}
        </ScrollView>

        {/* FAB */}
        <Animated.View
          entering={FadeInUp.delay(300).springify().damping(14)}
          style={{
            position: 'absolute',
            bottom: TAB_BAR_HEIGHT + insets.bottom + 12,
            right: 24,
          }}>
          <TouchableOpacity
            onPress={() => router.push('/add-savings-goal')}
            activeOpacity={0.85}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: c.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 10,
            }}>
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
