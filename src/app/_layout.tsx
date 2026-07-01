import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="switches/[deviceId]"
        options={{ headerShown: false, presentation: 'card' }}
      />
    </Stack>
  );
}
