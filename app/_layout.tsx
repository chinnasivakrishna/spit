import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" options={{ animation: 'none' }} />
  <Stack.Screen name="screens/LoginScreen" options={{ gestureEnabled: false }} />
  <Stack.Screen 
    name="screens/tabs" 
    options={{ 
      gestureEnabled: false,
      headerBackVisible: false
    }} 
  />
  <Stack.Screen name="group/GroupDetailScreen" />
  <Stack.Screen name="screens/AddExpenseScreen" />
  <Stack.Screen name="+not-found" />
</Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}