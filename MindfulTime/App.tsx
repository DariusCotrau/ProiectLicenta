import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={{
        colors: {
          primary: colors.primary,
          accent: colors.secondary,
        },
      }}>
        <StatusBar style="light" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
