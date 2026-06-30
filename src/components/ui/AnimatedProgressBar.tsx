import { useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedProgressBar({ progress, color, trackColor, height = 6, style }: Props) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${anim.value * 100}%`,
  }));

  return (
    <View
      style={[
        { height, backgroundColor: trackColor, borderRadius: height / 2, overflow: 'hidden' },
        style,
      ]}>
      <Animated.View
        style={[{ height, backgroundColor: color, borderRadius: height / 2 }, animStyle]}
      />
    </View>
  );
}
