import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import StorageService from '../services/StorageService';
import { UserStats, CompletedTask } from '../types';

const StatsScreen: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    const userStats = await StorageService.getUserStats();
    const tasks = await StorageService.getCompletedTasks();
    setStats(userStats);
    setCompletedTasks(tasks);
  };

  const getTasksForRange = (): CompletedTask[] => {
    const now = new Date();

    switch (timeRange) {
      case 'today':
        return completedTasks.filter(
          task => new Date(task.completedAt).toDateString() === now.toDateString()
        );
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return completedTasks.filter(
          task => new Date(task.completedAt) >= weekAgo
        );
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return completedTasks.filter(
          task => new Date(task.completedAt) >= monthAgo
        );
      default:
        return completedTasks;
    }
  };

  const rangeStats = getTasksForRange();
  const totalTimeEarned = rangeStats.reduce((sum, task) => sum + task.timeEarned, 0);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: 'today', label: 'Astăzi' },
              { value: 'week', label: 'Săptămână' },
              { value: 'month', label: 'Lună' },
            ]}
          />
        </Card.Content>
      </Card>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="check-circle" size={40} color={colors.success} />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {rangeStats.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Activități completate
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="clock-plus" size={40} color={colors.primary} />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {totalTimeEarned}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Minute câștigate
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="fire" size={40} color={colors.warning} />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats?.currentStreak || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Zile consecutive
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="trophy" size={40} color={colors.warning} />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats?.longestStreak || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Record streak
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Statistici totale
          </Text>
          <View style={styles.totalStatsRow}>
            <View style={styles.totalStatItem}>
              <Text variant="bodySmall" style={styles.totalStatLabel}>
                Total activități
              </Text>
              <Text variant="headlineSmall" style={styles.totalStatValue}>
                {stats?.totalTasksCompleted || 0}
              </Text>
            </View>
            <View style={styles.totalStatItem}>
              <Text variant="bodySmall" style={styles.totalStatLabel}>
                Total timp câștigat
              </Text>
              <Text variant="headlineSmall" style={styles.totalStatValue}>
                {stats?.totalTimeEarned || 0} min
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Activități recente
          </Text>
          {rangeStats.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="clipboard-text-off"
                size={48}
                color={colors.textSecondary}
              />
              <Text variant="bodyMedium" style={styles.emptyText}>
                Nu ai completat nicio activitate în această perioadă
              </Text>
            </View>
          ) : (
            rangeStats.slice(0, 10).map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskItemLeft}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.success}
                  />
                  <View style={styles.taskItemInfo}>
                    <Text variant="bodyMedium">Activitate completată</Text>
                    <Text variant="bodySmall" style={styles.taskItemDate}>
                      {new Date(task.completedAt).toLocaleString('ro-RO', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <Text variant="bodyMedium" style={styles.taskItemReward}>
                  +{task.timeEarned} min
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontWeight: 'bold',
    marginTop: 8,
    color: colors.primary,
  },
  statLabel: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  totalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalStatItem: {
    alignItems: 'center',
  },
  totalStatLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalStatValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskItemInfo: {
    marginLeft: 12,
  },
  taskItemDate: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  taskItemReward: {
    fontWeight: 'bold',
    color: colors.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default StatsScreen;
