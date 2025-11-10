import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import RewardService from '../services/RewardService';
import { UserStats, App, RewardBalance } from '../types';
import { Theme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import {
  Container,
  Card,
  Text,
  Row,
  Column,
  Spacer,
  ProgressBar,
} from '../components/common';

const HomeScreen: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [rewardBalance, setRewardBalance] = useState<RewardBalance | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { isTablet, getIconSize } = useResponsive();

  const loadData = async () => {
    const userStats = await StorageService.getUserStats();
    const userApps = await StorageService.getApps();
    const balance = await RewardService.getRewardBalance();
    setStats(userStats);
    setApps(userApps);
    setRewardBalance(balance);
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
  const usageProgress = totalTimeLimit > 0 ? (totalTimeUsed / totalTimeLimit) * 100 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Theme.colors.background }}
      contentContainerStyle={{ paddingBottom: Theme.spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Theme.colors.primary]}
        />
      }
    >
      {/* Welcome Card */}
      <Card elevation="md">
        <Column spacing={Theme.spacing.sm} align="center">
          <MaterialCommunityIcons
            name="clock-outline"
            size={getIconSize(48)}
            color={Theme.colors.primary}
          />
          <Text variant="h3" align="center" weight="700">
            Bine ai venit!
          </Text>
          <Text variant="body2" color={Theme.colors.textSecondary} align="center">
            Starea ta de astăzi
          </Text>
        </Column>
      </Card>

      {/* Rewards Summary Card */}
      {rewardBalance && (
        <Card elevation="md" style={{ backgroundColor: Theme.colors.secondary + '10' }}>
          <Column spacing={Theme.spacing.md}>
            <Row justify="space-between" align="center">
              <Row align="center" spacing={Theme.spacing.sm}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={getIconSize(32)}
                  color={Theme.colors.secondary}
                />
                <Text variant="h4" weight="600">
                  Recompense
                </Text>
              </Row>
              <Text variant="h2" weight="700" color={Theme.colors.secondary}>
                {Math.floor(rewardBalance.available / 60) > 0
                  ? `${Math.floor(rewardBalance.available / 60)}h ${rewardBalance.available % 60}m`
                  : `${rewardBalance.available}m`}
              </Text>
            </Row>
            <Text variant="body2" color={Theme.colors.textSecondary}>
              Timp disponibil pentru aplicații
            </Text>
            {rewardBalance.available > 0 && (
              <View style={{
                padding: Theme.spacing.sm,
                backgroundColor: Theme.colors.secondary + '20',
                borderRadius: Theme.borderRadius.md,
              }}>
                <Text variant="caption" color={Theme.colors.secondary} align="center">
                  💡 Vizitează tab-ul Recompense pentru a aloca timpul către aplicații
                </Text>
              </View>
            )}
          </Column>
        </Card>
      )}

      {/* App Usage Card */}
      <Card elevation="md">
        <Column spacing={Theme.spacing.md}>
          <Text variant="h4" weight="600">
            Utilizare aplicații
          </Text>
          <ProgressBar
            progress={usageProgress}
            color={usageProgress > 80 ? Theme.colors.error : Theme.colors.primary}
            showLabel
            label={`${totalTimeUsed} / ${totalTimeLimit} minute`}
            height={10}
          />
        </Column>
      </Card>

      {/* Stats Grid */}
      <Card elevation="md">
        <Column spacing={Theme.spacing.md}>
          <Text variant="h4" weight="600">
            Activități astăzi
          </Text>
          <Row justify="space-around" align="stretch">
            <Column align="center" spacing={Theme.spacing.xs} style={{ flex: 1 }}>
              <Text variant="h2" weight="700" color={Theme.colors.primary}>
                {stats?.tasksCompletedToday || 0}
              </Text>
              <Text variant="body2" color={Theme.colors.textSecondary} align="center">
                Completate
              </Text>
            </Column>
            <View style={{ width: 1, backgroundColor: Theme.colors.border, marginVertical: Theme.spacing.sm }} />
            <Column align="center" spacing={Theme.spacing.xs} style={{ flex: 1 }}>
              <Text variant="h2" weight="700" color={Theme.colors.success}>
                +{stats?.totalTimeEarned || 0}
              </Text>
              <Text variant="body2" color={Theme.colors.textSecondary} align="center">
                Minute câștigate
              </Text>
            </Column>
          </Row>
        </Column>
      </Card>

      {/* Streak Card */}
      <Card elevation="md">
        <Column spacing={Theme.spacing.md} align="center">
          <Text variant="h4" weight="600" style={{ alignSelf: 'flex-start' }}>
            Streak actual
          </Text>
          <Spacer size="sm" />
          <MaterialCommunityIcons
            name="fire"
            size={getIconSize(64)}
            color={Theme.colors.warning}
          />
          <Text variant="h1" weight="700">
            {stats?.currentStreak || 0}
          </Text>
          <Text variant="body2" color={Theme.colors.textSecondary}>
            zile consecutive
          </Text>
          <Spacer size="xs" />
          <Text variant="caption" color={Theme.colors.textSecondary}>
            Record: {stats?.longestStreak || 0} zile
          </Text>
        </Column>
      </Card>

      {/* Blocked Apps Warning */}
      {blockedApps.length > 0 && (
        <Card
          elevation="md"
          style={{ backgroundColor: Theme.colors.error + '10' }}
        >
          <Column spacing={Theme.spacing.sm}>
            <Row spacing={Theme.spacing.sm} align="center">
              <MaterialCommunityIcons
                name="alert"
                size={getIconSize(24)}
                color={Theme.colors.error}
              />
              <Text variant="h4" weight="600" color={Theme.colors.error}>
                Aplicații blocate
              </Text>
            </Row>
            <Text variant="body1">
              {blockedApps.length} {blockedApps.length === 1 ? 'aplicație este blocată' : 'aplicații sunt blocate'}
            </Text>
            <Text variant="body2" color={Theme.colors.textSecondary}>
              Completează activități pentru a câștiga mai mult timp
            </Text>
          </Column>
        </Card>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
