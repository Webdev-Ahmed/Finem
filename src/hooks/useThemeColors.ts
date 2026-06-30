import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/colors';

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
