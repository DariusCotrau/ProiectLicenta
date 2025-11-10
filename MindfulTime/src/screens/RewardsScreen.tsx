import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RewardService from '../services/RewardService';
import StorageService from '../services/StorageService';
import { Theme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import {
  formatTimeForAccessibility,
  getAccessibilityLabel,
  getAccessibilityHint,
} from '../utils/accessibility';
import {
  Container,
  Card,
  Text,
  Row,
  Column,
  Spacer,
  Button,
} from '../components/common';
import {
  RewardBalance,
  RewardTransaction,
  Achievement,
  StreakBonus,
} from '../types';

const RewardsScreen: React.FC = () => {
  const [balance, setBalance] = useState<RewardBalance | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentStreakBonus, setCurrentStreakBonus] = useState<StreakBonus | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isTablet, getIconSize } = useResponsive();

  const loadData = async () => {
    try {
      setError(null);
      const summary = await RewardService.getRewardsSummary();
      setBalance(summary.balance);
      setTransactions(summary.recentTransactions);
      setAchievements(await RewardService.getAchievements());
      setCurrentStreakBonus(summary.currentStreakBonus);

      const stats = await StorageService.getUserStats();
      setCurrentStreak(stats.currentStreak);
    } catch (err) {
      setError('Nu s-au putut încărca datele. Te rog încearcă din nou.');
      console.error('Error loading rewards data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'earned':
        return 'plus-circle';
      case 'spent':
        return 'minus-circle';
      case 'bonus':
        return 'gift';
      default:
        return 'circle';
    }
  };

  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'earned':
        return Theme.colors.success;
      case 'spent':
        return Theme.colors.error;
      case 'bonus':
        return Theme.colors.secondary;
      default:
        return Theme.colors.text;
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={Theme.colors.primary}
          accessible={true}
          accessibilityLabel="Se încarcă recompensele"
        />
        <Spacer size="md" />
        <Text variant="body1" color={Theme.colors.textSecondary}>
          Se încarcă datele...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={getIconSize(64)}
          color={Theme.colors.error}
        />
        <Spacer size="md" />
        <Text variant="h4" weight="600" align="center">
          Eroare
        </Text>
        <Spacer size="sm" />
        <Text variant="body2" color={Theme.colors.textSecondary} align="center">
          {error}
        </Text>
        <Spacer size="lg" />
        <Button
          title="Încearcă din nou"
          onPress={loadData}
          variant="primary"
          accessibilityLabel="Încearcă să încarci din nou datele"
          accessibilityHint="Apasă pentru a reîncărca informațiile despre recompense"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          accessibilityLabel="Reîmprospătează lista de recompense"
        />
      }
      accessible={true}
      accessibilityLabel="Ecran recompense"
      accessibilityHint="Derulează pentru a vedea balantă, achievement-uri și istoric"
    >
      <Container padding>
        <Spacer size="md" />

        {/* Header */}
        <Column align="center">
          <MaterialCommunityIcons
            name="trophy"
            size={isTablet ? 100 : 70}
            color={Theme.colors.primary}
            accessible={false}
          />
          <Spacer size="sm" />
          <Text
            variant="h2"
            weight="bold"
            align="center"
            accessible={true}
            accessibilityRole="header"
          >
            Recompense
          </Text>
          <Text
            variant="body2"
            color={Theme.colors.textSecondary}
            align="center"
            accessible={true}
          >
            Câștigă timp pentru aplicații completând activități
          </Text>
        </Column>

        <Spacer size="xl" />

        {/* Balance Card */}
        {balance && (
          <Card>
            <Column>
              <Row justify="space-between" align="center">
                <Text variant="h3" weight="600">
                  Balanța Ta
                </Text>
                <MaterialCommunityIcons
                  name="wallet"
                  size={getIconSize(32)}
                  color={Theme.colors.primary}
                />
              </Row>
              <Spacer size="lg" />

              <Row justify="space-around">
                <Column align="center">
                  <Text variant="h1" weight="bold" color={Theme.colors.primary}>
                    {formatMinutes(balance.available)}
                  </Text>
                  <Spacer size="xs" />
                  <Text variant="caption" color={Theme.colors.textSecondary}>
                    Disponibil
                  </Text>
                </Column>

                <View style={styles.divider} />

                <Column align="center">
                  <Text variant="h2" weight="600">
                    {formatMinutes(balance.totalEarned)}
                  </Text>
                  <Spacer size="xs" />
                  <Text variant="caption" color={Theme.colors.textSecondary}>
                    Total Câștigat
                  </Text>
                </Column>
              </Row>

              <Spacer size="md" />

              <Row justify="space-around">
                <Column align="center">
                  <Text variant="body1" weight="600">
                    {formatMinutes(balance.spent)}
                  </Text>
                  <Text variant="caption" color={Theme.colors.textSecondary}>
                    Cheltuit
                  </Text>
                </Column>

                <Column align="center">
                  <Text variant="body1" weight="600">
                    {formatMinutes(balance.pendingAllocation)}
                  </Text>
                  <Text variant="caption" color={Theme.colors.textSecondary}>
                    În Așteptare
                  </Text>
                </Column>
              </Row>
            </Column>
          </Card>
        )}

        <Spacer size="lg" />

        {/* Current Streak Bonus */}
        {currentStreak > 0 && (
          <>
            <Card>
              <Column>
                <Row justify="space-between" align="center">
                  <Text variant="h4" weight="600">
                    Streak Curent
                  </Text>
                  <MaterialCommunityIcons
                    name="fire"
                    size={getIconSize(32)}
                    color={Theme.colors.warning}
                  />
                </Row>
                <Spacer size="md" />

                <Row align="center">
                  <Text variant="h1" weight="bold" color={Theme.colors.warning}>
                    {currentStreak}
                  </Text>
                  <Spacer size="sm" />
                  <Text variant="body1">zile consecutive</Text>
                </Row>

                {currentStreakBonus && (
                  <>
                    <Spacer size="md" />
                    <View style={styles.bonusBox}>
                      <Row align="center">
                        <MaterialCommunityIcons
                          name="star"
                          size={getIconSize(24)}
                          color={Theme.colors.secondary}
                        />
                        <Spacer size="sm" />
                        <Text variant="body2" weight="600" color={Theme.colors.secondary}>
                          +{Math.round((currentStreakBonus.multiplier - 1) * 100)}% Bonus Activ!
                        </Text>
                      </Row>
                      <Spacer size="xs" />
                      <Text variant="caption" color={Theme.colors.textSecondary}>
                        {currentStreakBonus.description}
                      </Text>
                    </View>
                  </>
                )}
              </Column>
            </Card>
            <Spacer size="lg" />
          </>
        )}

        {/* Achievements */}
        <Card>
          <Column>
            <Row justify="space-between" align="center">
              <Text variant="h4" weight="600">
                Achievement-uri
              </Text>
              <MaterialCommunityIcons
                name="medal"
                size={getIconSize(32)}
                color={Theme.colors.primary}
              />
            </Row>
            <Spacer size="md" />

            <Text variant="body2" color={Theme.colors.textSecondary}>
              {unlockedAchievements.length} / {achievements.length} deblocate
            </Text>
            <Spacer size="md" />

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <>
                <Text variant="body2" weight="600">
                  Deblocate:
                </Text>
                <Spacer size="sm" />
                {unlockedAchievements.slice(0, 3).map((achievement) => (
                  <View key={achievement.id}>
                    <View style={styles.achievementItem}>
                      <MaterialCommunityIcons
                        name={achievement.icon as any}
                        size={getIconSize(32)}
                        color={Theme.colors.secondary}
                      />
                      <Spacer size="sm" />
                      <Column style={{ flex: 1 }}>
                        <Text variant="body2" weight="600">
                          {achievement.title}
                        </Text>
                        <Text variant="caption" color={Theme.colors.textSecondary}>
                          {achievement.description}
                        </Text>
                        {achievement.rewardBonus && achievement.rewardBonus > 0 && (
                          <Text variant="caption" color={Theme.colors.secondary}>
                            Bonus: +{achievement.rewardBonus}m
                          </Text>
                        )}
                      </Column>
                    </View>
                    <Spacer size="sm" />
                  </View>
                ))}
                {unlockedAchievements.length > 3 && (
                  <Text variant="caption" color={Theme.colors.textSecondary}>
                    +{unlockedAchievements.length - 3} altele...
                  </Text>
                )}
              </>
            )}

            {lockedAchievements.length > 0 && (
              <>
                <Spacer size="md" />
                <Text variant="body2" weight="600">
                  Următorul obiectiv:
                </Text>
                <Spacer size="sm" />
                <View style={styles.achievementItem}>
                  <MaterialCommunityIcons
                    name={lockedAchievements[0].icon as any}
                    size={getIconSize(32)}
                    color={Theme.colors.disabled}
                  />
                  <Spacer size="sm" />
                  <Column style={{ flex: 1 }}>
                    <Text variant="body2" weight="600" color={Theme.colors.textSecondary}>
                      {lockedAchievements[0].title}
                    </Text>
                    <Text variant="caption" color={Theme.colors.textSecondary}>
                      {lockedAchievements[0].description}
                    </Text>
                  </Column>
                </View>
              </>
            )}
          </Column>
        </Card>

        <Spacer size="lg" />

        {/* Recent Transactions */}
        <Card>
          <Column>
            <Row justify="space-between" align="center">
              <Text variant="h4" weight="600">
                Istoric Tranzacții
              </Text>
              <MaterialCommunityIcons
                name="history"
                size={getIconSize(32)}
                color={Theme.colors.primary}
              />
            </Row>
            <Spacer size="md" />

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={getIconSize(48)}
                  color={Theme.colors.textSecondary}
                  accessible={false}
                />
                <Spacer size="md" />
                <Text variant="body2" color={Theme.colors.textSecondary} align="center">
                  Nicio tranzacție încă
                </Text>
                <Spacer size="sm" />
                <Text variant="caption" color={Theme.colors.textSecondary} align="center">
                  Completează activități pentru a câștiga timp{'\n'}și a vedea tranzacții aici
                </Text>
              </View>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <View key={transaction.id}>
                  <Row align="center" justify="space-between">
                    <Row align="center" style={{ flex: 1 }}>
                      <MaterialCommunityIcons
                        name={getTransactionIcon(transaction.type) as any}
                        size={getIconSize(24)}
                        color={getTransactionColor(transaction.type)}
                      />
                      <Spacer size="sm" />
                      <Column style={{ flex: 1 }}>
                        <Text variant="body2" weight="600">
                          {transaction.reason}
                        </Text>
                        <Text variant="caption" color={Theme.colors.textSecondary}>
                          {new Date(transaction.timestamp).toLocaleDateString('ro-RO')} •{' '}
                          {new Date(transaction.timestamp).toLocaleTimeString('ro-RO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Column>
                    </Row>
                    <Text
                      variant="body1"
                      weight="600"
                      color={getTransactionColor(transaction.type)}
                    >
                      {transaction.type === 'spent' ? '-' : '+'}
                      {formatMinutes(transaction.amount)}
                    </Text>
                  </Row>
                  <Spacer size="md" />
                </View>
              ))
            )}
          </Column>
        </Card>

        <Spacer size="xl" />
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.background,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: Theme.colors.border,
  },
  bonusBox: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.secondary + '10',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.secondary + '30',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
    minHeight: 56, // Minimum touch target size
  },
  emptyState: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
});

export default RewardsScreen;
