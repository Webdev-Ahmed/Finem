import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import {
  getDelegationById,
  getDelegationHistory,
  getActiveDelegations,
  updateDelegation,
  deleteDelegation,
  DelegationPeriodWithSpent,
  DelegationWithPeriod,
} from '@/db/queries/delegations';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { DELEGATION_ICONS } from '@/constants/icons';
import { COLOR_PALETTE } from '@/constants/palette';
import { Delegation } from '@/types';

export default function DelegationDetailModal() {
  const c = useThemeColors();
  const { format, currencySymbol } = useCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [current, setCurrent] = useState<DelegationWithPeriod | null>(null);
  const [history, setHistory] = useState<DelegationPeriodWithSpent[]>([]);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DELEGATION_ICONS[0]);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    Promise.all([
      getDelegationById(Number(id)),
      getDelegationHistory(Number(id)),
      getActiveDelegations(),
    ])
      .then(([d, hist, active]) => {
        if (!d) return;
        setDelegation(d);
        setHistory(hist);
        setCurrent(active.find((a) => a.id === d.id) ?? null);
        setName(d.name);
        setIcon(d.icon);
        setColor(d.color);
        setBudget(String(d.default_budget));
      })
      .catch(console.error);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!delegation || !current) return null;

  const remaining = current.budgeted_amount - current.spent;
  const pct = current.budgeted_amount > 0 ? current.spent / current.budgeted_amount : 0;
  const over = remaining < 0;

  async function handleSaveEdit() {
    const amount = parseFloat(budget.replace(/,/g, ''));
    if (!name.trim() || isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid input', 'Enter a name and valid budget amount.');
      return;
    }
    setSaving(true);
    try {
      await updateDelegation(Number(id), name.trim(), icon, color, amount);
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Delegation',
      `Delete "${delegation?.name}" and its full history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await deleteDelegation(Number(id));
            router.back();
          },
        },
      ]
    );
  }

  return (
    <ModalSheet snapPoint="90%">
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
          {delegation.name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={() => setEditing((e) => !e)} hitSlop={10}>
            <Ionicons
              name={editing ? 'close-circle-outline' : 'pencil-outline'}
              size={22}
              color={c.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={10} disabled={deleting}>
            <Ionicons name="trash-outline" size={22} color={c.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {editing ? (
          <View style={{ marginBottom: 28 }}>
            <Label text="Name" />
            <BottomSheetTextInput
              value={name}
              onChangeText={setName}
              placeholderTextColor={c.textMuted}
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 17,
                color: c.text,
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: c.primary,
                marginBottom: 20,
              }}
            />

            <Label text="Icon" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {DELEGATION_ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: icon === ic ? color + '22' : c.surface,
                    borderWidth: 1.5,
                    borderColor: icon === ic ? color : c.border,
                  }}>
                  <Text style={{ fontSize: 20 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Label text="Color" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {COLOR_PALETTE.map((col) => (
                <TouchableOpacity
                  key={col}
                  onPress={() => setColor(col)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: col,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: color === col ? 3 : 0,
                    borderColor: c.text,
                  }}>
                  {color === col && <Ionicons name="checkmark" size={14} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            <Label text={`Budget (current & future periods) · ${currencySymbol}`} />
            <BottomSheetTextInput
              value={budget}
              onChangeText={setBudget}
              keyboardType="decimal-pad"
              placeholderTextColor={c.textMuted}
              style={{
                fontFamily: 'Inter-Bold',
                fontSize: 28,
                color: c.text,
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1.5,
                borderColor: c.primary,
                marginBottom: 20,
              }}
            />

            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={saving}
              activeOpacity={0.85}
              style={{
                backgroundColor: c.primary,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
              }}>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#fff' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: color + '18',
              borderRadius: 24,
              padding: 24,
              marginBottom: 28,
              borderWidth: 1.5,
              borderColor: color + '55',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Text style={{ fontSize: 30 }}>{icon}</Text>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: c.text }}>
                {delegation.name}
              </Text>
            </View>

            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
              {over ? 'Over budget' : 'Remaining this period'}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Bold',
                fontSize: 32,
                lineHeight: 38,
                color: over ? c.danger : c.text,
                marginBottom: 12,
              }}
              numberOfLines={1}>
              {format(Math.abs(remaining))}
            </Text>

            <AnimatedProgressBar
              progress={pct}
              color={over ? c.danger : color}
              trackColor={c.border}
              height={7}
              style={{ marginBottom: 10 }}
            />
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted }}>
              {format(current.spent)} spent of {format(current.budgeted_amount)}
            </Text>
          </View>
        )}

        <Label text="Period History" />
        {history.length === 0 ? (
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
              No history yet
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
            {history.map((p, i) => {
              const isCurrent = p.period_end === null;
              const periodPct = p.budgeted_amount > 0 ? p.spent / p.budgeted_amount : 0;
              return (
                <View
                  key={p.id}
                  style={{
                    padding: 16,
                    borderBottomWidth: i === history.length - 1 ? 0 : 1,
                    borderBottomColor: c.border,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}>
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: c.text }}>
                      {new Date(p.period_start).toLocaleDateString('default', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      {' — '}
                      {isCurrent
                        ? 'Now'
                        : new Date(p.period_end!).toLocaleDateString('default', {
                            day: 'numeric',
                            month: 'short',
                          })}
                    </Text>
                    {isCurrent && (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor: c.primary + '1E',
                        }}>
                        <Text
                          style={{ fontFamily: 'Inter-SemiBold', fontSize: 9, color: c.primary }}>
                          CURRENT
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 14,
                      color: c.text,
                      marginBottom: 6,
                    }}>
                    {format(p.spent)} of {format(p.budgeted_amount)}
                  </Text>
                  <AnimatedProgressBar
                    progress={periodPct}
                    color={periodPct > 1 ? c.danger : color}
                    trackColor={c.border}
                    height={4}
                  />
                </View>
              );
            })}
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
