import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import StorageService from '../services/StorageService';
import { UserStats, App } from '../types';

const HomeScreen: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const userStats = await StorageService.getUserStats();
    const userApps = await StorageService.getApps();
    setStats(userStats);
    setApps(userApps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const blockedApps = apps.filter(app => app.isBlocked);
  const totalTimeUsed = apps.reduce((sum, app) => sum + app.usedTime, 0);
  const totalTimeLimit = apps.reduce((sum, app) => sum + app.dailyLimit, 0);
  const usageProgress = totalTimeLimit > 0 ? totalTimeUsed / totalTimeLimit : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="clock-outline" size={40} color={colors.primary} />
            <Text variant="headlineSmall" style={styles.title}>
              Bine ai venit!
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Starea ta de astăzi
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Utilizare aplicații
          </Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={usageProgress}
              color={usageProgress > 0.8 ? colors.error : colors.primary}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {totalTimeUsed} / {totalTimeLimit} minute
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Activități astăzi
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {stats?.tasksCompletedToday || 0}
              </Text>
              <Text variant="bodySmall">Completate</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.success }]}>
                +{stats?.totalTimeEarned || 0}
              </Text>
              <Text variant="bodySmall">Minute câștigate</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Streak actual
          </Text>
          <View style={styles.streakContainer}>
            <MaterialCommunityIcons name="fire" size={50} color={colors.warning} />
            <Text variant="headlineLarge" style={styles.streakNumber}>
              {stats?.currentStreak || 0}
            </Text>
            <Text variant="bodySmall">zile consecutive</Text>
          </View>
          <Text variant="bodySmall" style={styles.streakRecord}>
            Record: {stats?.longestStreak || 0} zile
          </Text>
        </Card.Content>
      </Card>

      {blockedApps.length > 0 && (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <View style={styles.warningHeader}>
              <MaterialCommunityIcons name="alert" size={24} color={colors.error} />
              <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.error }]}>
                Aplicații blocate
              </Text>
            </View>
            <Text variant="bodyMedium">
              {blockedApps.length} {blockedApps.length === 1 ? 'aplicație este blocată' : 'aplicații sunt blocate'}
            </Text>
            <Text variant="bodySmall" style={styles.warningSubtext}>
              Completează activități pentru a câștiga mai mult timp
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'right',
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  streakContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  streakNumber: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  streakRecord: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 8,
  },
  warningCard: {
    backgroundColor: '#ffebee',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningSubtext: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 20,
  },
});

export default HomeScreen;
