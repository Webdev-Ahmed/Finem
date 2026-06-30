import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { setSetting } from '@/db/queries/settings';
import { useThemeColors } from '@/hooks/useThemeColors';

const CURRENCIES = [
  { code: 'USD', symbol: '$'  },
  { code: 'EUR', symbol: '€'  },
  { code: 'GBP', symbol: '£'  },
  { code: 'PKR', symbol: '₨'  },
  { code: 'AED', symbol: 'د.إ'},
  { code: 'SAR', symbol: '﷼'  },
  { code: 'CAD', symbol: 'CA$'},
  { code: 'AUD', symbol: 'A$' },
  { code: 'JPY', symbol: '¥'  },
  { code: 'INR', symbol: '₹'  },
  { code: 'SGD', symbol: 'S$' },
  { code: 'CHF', symbol: 'Fr' },
  { code: 'MYR', symbol: 'RM' },
  { code: 'NGN', symbol: '₦'  },
  { code: 'BRL', symbol: 'R$' },
  { code: 'ZAR', symbol: 'R'  },
  { code: 'CNY', symbol: '¥'  },
  { code: 'KES', symbol: 'KSh'},
];

export default function OnboardingStep2() {
  const c = useThemeColors();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim().length > 0;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    try {
      await setSetting('user_name', name.trim());
      await setSetting('currency', currency);
      router.push('/(onboarding)/step-3');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 52, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Header */}
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 42, lineHeight: 48, color: c.text }}>
              {'Tell us\nabout you.'}
            </Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: c.textMuted, marginTop: 10, marginBottom: 44 }}>
              Everything stays on your device only.
            </Text>

            {/* Name input */}
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, letterSpacing: 1.4, color: c.textMuted, textTransform: 'uppercase', marginBottom: 14 }}>
              Your name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Alex"
              placeholderTextColor={c.textMuted}
              autoCapitalize="words"
              autoFocus
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 30,
                color: c.text,
                borderBottomWidth: 2,
                borderBottomColor: name.length > 0 ? c.primary : c.border,
                paddingBottom: 10,
                marginBottom: 48,
              }}
            />

            {/* Currency picker */}
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, letterSpacing: 1.4, color: c.textMuted, textTransform: 'uppercase', marginBottom: 16 }}>
              Currency
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CURRENCIES.map((cur) => {
                const selected = currency === cur.code;
                return (
                  <TouchableOpacity
                    key={cur.code}
                    onPress={() => setCurrency(cur.code)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      backgroundColor: selected ? c.primary : c.surface,
                      borderColor: selected ? c.primary : c.border,
                    }}>
                    <Text style={{
                      fontFamily: selected ? 'Inter-SemiBold' : 'Inter-Regular',
                      fontSize: 14,
                      color: selected ? '#fff' : c.text,
                    }}>
                      {cur.symbol} {cur.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* CTA */}
          <View style={{ paddingHorizontal: 32, paddingBottom: 24, paddingTop: 12 }}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!canContinue || loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: canContinue ? c.primary : c.border,
                borderRadius: 16,
                padding: 18,
                alignItems: 'center',
              }}>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
                {loading ? 'Saving...' : 'Continue →'}
              </Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
