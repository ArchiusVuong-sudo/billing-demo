import { Stack } from 'expo-router';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF5F00',
    secondary: '#FFB833',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: '#fff',
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Select Avatar' }} />
          <Stack.Screen name="session" options={{ title: 'Session' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
