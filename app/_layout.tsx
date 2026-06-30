import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDB } from '@/db';
import { rolloverDelegations } from '@/db/queries/delegations';
import { AppProvider } from '@/context/AppContext';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    initDB()
      .then(() => rolloverDelegations())
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('DB init failed:', e);
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, dbReady]);

  if ((!fontsLoaded && !fontError) || !dbReady) return null;

  const sheetOptions = {
    presentation: 'transparentModal' as const,
    animation: 'none' as const,
    contentStyle: { backgroundColor: 'transparent' },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />

          {/* Bottom sheets */}
          <Stack.Screen name="add-transaction" options={sheetOptions} />
          <Stack.Screen name="add-savings-goal" options={sheetOptions} />
          <Stack.Screen name="savings-detail" options={sheetOptions} />
          <Stack.Screen name="add-loan" options={sheetOptions} />
          <Stack.Screen name="loan-detail" options={sheetOptions} />
          <Stack.Screen name="add-category" options={sheetOptions} />
          <Stack.Screen name="add-delegation" options={sheetOptions} />
          <Stack.Screen name="delegation-detail" options={sheetOptions} />
          <Stack.Screen name="edit-profile" options={sheetOptions} />

          {/* Full pages (slide from right) */}
          <Stack.Screen name="categories" />
          <Stack.Screen name="delegations" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
