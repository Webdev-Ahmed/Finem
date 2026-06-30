import Animated, { FadeIn } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

interface Props {
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedCard({ index = 0, children, style }: Props) {
  return (
    <Animated.View entering={FadeIn.delay(index * 40).duration(220)} style={style}>
      {children}
    </Animated.View>
  );
}
