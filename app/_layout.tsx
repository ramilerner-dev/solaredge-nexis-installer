import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InstallationProvider } from '@/context/InstallationContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <InstallationProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="site-details" />
          <Stack.Screen name="procedure-selection" />
          <Stack.Screen name="step" />
          <Stack.Screen name="summary" />
          <Stack.Screen name="test-steps" />
        </Stack>
      </InstallationProvider>
    </SafeAreaProvider>
  );
}
