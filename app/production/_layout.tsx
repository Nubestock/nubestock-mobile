import { Stack } from 'expo-router';

export default function ProductionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" options={{ headerShown: false }} />
    </Stack>
  );
}
