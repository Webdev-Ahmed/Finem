import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const BLOCKS = [
  { height: 104, opacity: 0.22 },
  { height: 72,  opacity: 0.13 },
  { height: 88,  opacity: 0.18 },
  { height: 56,  opacity: 0.10 },
  { height: 80,  opacity: 0.16 },
];

export default function OnboardingStep1() {
  return (
    <View style={{ flex: 1, backgroundColor: '#E84520' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 48 }}>

          {/* Decorative blocks — nod to the 3D cube art in the designs */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 52 }}>
            {BLOCKS.map((b, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: b.height,
                  backgroundColor: `rgba(255,255,255,${b.opacity})`,
                  borderRadius: 18,
                }}
              />
            ))}
          </View>

          {/* Headline */}
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 52, lineHeight: 58, color: '#fff' }}>
            {'FINANCE\nIS YOUR\nPOWER.'}
          </Text>

          {/* Divider */}
          <View style={{ width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.45)', marginTop: 32, marginBottom: 20 }} />

          {/* Subtext */}
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, lineHeight: 26, color: 'rgba(255,255,255,0.72)' }}>
            Track spending, set goals, and manage loans — completely offline and private.
          </Text>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 32, paddingBottom: 40 }}>
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/step-2')}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: '#fff' }}>
              Get started
            </Text>
            <Text style={{ fontSize: 22, color: '#fff' }}>→</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
