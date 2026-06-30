import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getCategoryById, insertCategory, updateCategory } from '@/db/queries/categories';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { CATEGORY_ICONS } from '@/constants/icons';
import { COLOR_PALETTE } from '@/constants/palette';
import { CategoryType } from '@/types';

export default function AddCategoryModal() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCategoryById(Number(id))
      .then((cat) => {
        if (!cat) return;
        setName(cat.name);
        setIcon(cat.icon);
        setColor(cat.color);
        setType(cat.type);
      })
      .catch(console.error);
  }, [id]);

  const canSave = name.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateCategory(Number(id), name.trim(), icon, color);
      } else {
        await insertCategory(name.trim(), icon, color, type, false);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save category.');
      setSaving(false);
    }
  }

  return (
    <ModalSheet snapPoint="82%">
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
          {isEdit ? 'Edit Category' : 'New Category'}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {!isEdit && (
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 24,
            marginBottom: 20,
            backgroundColor: c.surfaceAlt,
            borderRadius: 14,
            padding: 4,
          }}>
          {(['EXPENSE', 'INCOME'] as CategoryType[]).map((t) => (
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
                {t === 'EXPENSE' ? 'Expense' : 'Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Label text="Name" />
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Subscriptions"
          placeholderTextColor={c.textMuted}
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 17,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: name.length > 0 ? c.primary : c.border,
            marginBottom: 24,
          }}
        />

        <Label text="Icon" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {CATEGORY_ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              onPress={() => setIcon(ic)}
              activeOpacity={0.7}
              style={{
                width: 48,
                height: 48,
                borderRadius: 13,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: icon === ic ? color + '22' : c.surface,
                borderWidth: 1.5,
                borderColor: icon === ic ? color : c.border,
              }}>
              <Text style={{ fontSize: 22 }}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label text="Color" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {COLOR_PALETTE.map((col) => (
            <TouchableOpacity
              key={col}
              onPress={() => setColor(col)}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: col,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: color === col ? 3 : 0,
                borderColor: c.text,
              }}>
              {color === col && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 }}>
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
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
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
