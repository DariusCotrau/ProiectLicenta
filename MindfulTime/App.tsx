import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { colors } from './src/constants/colors';
import { initializeDemoData } from './src/utils/initializeDemoData';
import { initializeDefaultTasks } from './src/utils/initializeTasks';
import RewardService from './src/services/RewardService';
import DatabaseService from './src/database/DatabaseService';
import AuthService from './src/services/AuthService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing database...');
        // Initialize database first
        await DatabaseService.initialize();
        console.log('Database initialized');

        // Initialize demo users
        console.log('Initializing demo users...');
        await AuthService.initializeDemoUsers();
        console.log('Demo users initialized');

        // Initialize default tasks
        console.log('Initializing default tasks...');
        await initializeDefaultTasks();
        console.log('Default tasks initialized');

        // Initialize demo data on first launch
        console.log('Initializing demo data...');
        await initializeDemoData();
        console.log('Demo data initialized');

        // Initialize reward system
        console.log('Initializing reward system...');
        await RewardService.initialize();
        console.log('Reward system initialized');

        console.log('App initialization complete');
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={{
        colors: {
          primary: colors.primary,
          accent: colors.secondary,
        },
      }}>
        <AuthProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
