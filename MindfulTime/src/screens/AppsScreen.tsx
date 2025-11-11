import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, Chip, Banner } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { App, AppCategory } from '../types';
import StorageService from '../services/StorageService';
import TimeLimitService from '../services/TimeLimitService';
import NativeUsageStatsService from '../services/NativeUsageStatsService.android';
import { useFocusEffect } from '@react-navigation/native';

const AppsScreen: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  useEffect(() => {
    loadApps();
    checkPermissions();
  }, []);

  // Verifică permisiunile când ecranul devine focalizat
  useFocusEffect(
    React.useCallback(() => {
      checkPermissions();
      if (hasPermission) {
        syncUsageData();
      }
    }, [hasPermission])
  );

  const loadApps = async () => {
    const userApps = await StorageService.getApps();
    setApps(userApps);
  };

  const checkPermissions = async () => {
    setIsCheckingPermission(true);
    try {
      if (!NativeUsageStatsService.isAvailable()) {
        console.log('NativeUsageStatsService not available');
        setHasPermission(false);
        setShowPermissionBanner(false);
        return;
      }

      const permission = await NativeUsageStatsService.hasPermission();
      setHasPermission(permission);
      setShowPermissionBanner(!permission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermission(false);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const requestPermission = async () => {
    try {
      await NativeUsageStatsService.requestPermission();
      Alert.alert(
        'Permisiune necesară',
        'Te rog să acorzi permisiunea "Usage Access" pentru MindfulTime din lista de aplicații care se va deschide.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Eroare', 'Nu s-a putut deschide setările pentru permisiuni');
    }
  };

  const syncUsageData = async () => {
    if (!hasPermission || isSyncing) return;

    setIsSyncing(true);
    try {
      // Obține datele de utilizare pentru ziua curentă
      const usageStats = await NativeUsageStatsService.getTodayUsageStats();

      if (usageStats.length === 0) {
        console.log('No usage stats available');
        setIsSyncing(false);
        return;
      }

      // Actualizează aplicațiile existente cu datele reale de utilizare
      const updatedApps = [...apps];
      let hasChanges = false;

      for (const app of updatedApps) {
        const stat = usageStats.find(s => s.packageName === app.packageName);
        if (stat) {
          // Convertește milliseconds în minute
          const usedTimeInMinutes = Math.round(stat.totalTimeInForeground / (1000 * 60));
          if (app.usedTime !== usedTimeInMinutes) {
            app.usedTime = usedTimeInMinutes;
            app.isBlocked = usedTimeInMinutes >= app.dailyLimit;
            hasChanges = true;

            // Salvează actualizarea în storage
            await StorageService.updateApp(app.id, {
              usedTime: usedTimeInMinutes,
              isBlocked: app.isBlocked,
            });
          }
        }
      }

      if (hasChanges) {
        setApps(updatedApps);
      }
    } catch (error) {
      console.error('Error syncing usage data:', error);
      Alert.alert('Eroare', 'Nu s-au putut sincroniza datele de utilizare');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadApps(), syncUsageData()]);
  };

  const handleEditLimit = (app: App) => {
    setSelectedApp(app);
    setNewLimit(app.dailyLimit.toString());
    setModalVisible(true);
  };

  const saveNewLimit = async () => {
    if (!selectedApp) return;

    const limit = parseInt(newLimit);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Eroare', 'Te rog introdu un număr valid de minute');
      return;
    }

    await StorageService.updateApp(selectedApp.id, { dailyLimit: limit });
    setModalVisible(false);
    loadApps();
  };

  const getProgressColor = (app: App): string => {
    const percentage = app.usedTime / app.dailyLimit;
    if (percentage >= 1) return colors.error;
    if (percentage >= 0.8) return colors.warning;
    return colors.success;
  };

  const getStatusIcon = (app: App): string => {
    if (app.isBlocked) return 'block-helper';
    const percentage = app.usedTime / app.dailyLimit;
    if (percentage >= 0.8) return 'alert';
    return 'check-circle';
  };

  const getStatusColor = (app: App): string => {
    if (app.isBlocked) return colors.error;
    const percentage = app.usedTime / app.dailyLimit;
    if (percentage >= 0.8) return colors.warning;
    return colors.success;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      {showPermissionBanner && (
        <Banner
          visible={showPermissionBanner}
          actions={[
            {
              label: 'Acordă permisiune',
              onPress: requestPermission,
            },
            {
              label: 'Închide',
              onPress: () => setShowPermissionBanner(false),
            },
          ]}
          icon={({ size }) => (
            <MaterialCommunityIcons name="shield-alert" size={size} color={colors.warning} />
          )}
        >
          Pentru a sincroniza datele de utilizare reale de pe telefon, acordă permisiunea "Usage Access".
        </Banner>
      )}

      <ScrollView
        style={styles.appsList}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={styles.infoTitle}>
                Gestionare aplicații
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              Setează limite de timp pentru aplicațiile tale favorite. Când atingi limita, vei putea câștiga mai mult timp completând activități mindfulness.
            </Text>

            {hasPermission && (
              <View style={styles.syncContainer}>
                <View style={styles.syncInfo}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text variant="bodySmall" style={styles.syncText}>
                    Date sincronizate cu telefon
                  </Text>
                </View>
                <Button
                  mode="text"
                  onPress={syncUsageData}
                  loading={isSyncing}
                  disabled={isSyncing}
                  compact
                >
                  {isSyncing ? 'Sincronizare...' : 'Sincronizează'}
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {apps.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="apps" size={64} color={colors.textSecondary} />
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nu ai aplicații monitorizate
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Adaugă aplicații pentru a le monitoriza timpul de utilizare
            </Text>
            <Button mode="contained" style={styles.addButton}>
              Adaugă aplicație
            </Button>
          </View>
        ) : (
          apps.map((app) => (
            <Card key={app.id} style={styles.appCard}>
              <Card.Content>
                <View style={styles.appHeader}>
                  <View style={styles.appIconContainer}>
                    <MaterialCommunityIcons
                      name="cellphone"
                      size={40}
                      color={getStatusColor(app)}
                    />
                  </View>
                  <View style={styles.appInfo}>
                    <Text variant="titleMedium" style={styles.appName}>
                      {app.name}
                    </Text>
                    <View style={styles.statusContainer}>
                      <MaterialCommunityIcons
                        name={getStatusIcon(app) as any}
                        size={16}
                        color={getStatusColor(app)}
                      />
                      <Text variant="bodySmall" style={[styles.statusText, { color: getStatusColor(app) }]}>
                        {app.isBlocked ? 'Blocat' : 'Activ'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.timeInfo}>
                  <View style={styles.timeRow}>
                    <Text variant="bodySmall" style={styles.timeLabel}>
                      Utilizat:
                    </Text>
                    <Text variant="bodyMedium" style={styles.timeValue}>
                      {formatTime(app.usedTime)}
                    </Text>
                  </View>
                  <View style={styles.timeRow}>
                    <Text variant="bodySmall" style={styles.timeLabel}>
                      Limită:
                    </Text>
                    <Text variant="bodyMedium" style={styles.timeValue}>
                      {formatTime(app.dailyLimit)}
                    </Text>
                  </View>
                  <View style={styles.timeRow}>
                    <Text variant="bodySmall" style={styles.timeLabel}>
                      Rămas:
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.timeValue, { color: getProgressColor(app) }]}
                    >
                      {formatTime(Math.max(0, app.dailyLimit - app.usedTime))}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.progressBarContainer,
                    { backgroundColor: colors.textSecondary + '20' },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, (app.usedTime / app.dailyLimit) * 100)}%`,
                        backgroundColor: getProgressColor(app),
                      },
                    ]}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <Button
                    mode="outlined"
                    onPress={() => handleEditLimit(app)}
                    style={styles.actionButton}
                  >
                    Editează limita
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Setează limita zilnică
          </Text>
          {selectedApp && (
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              {selectedApp.name}
            </Text>
          )}
          <TextInput
            label="Minute pe zi"
            value={newLimit}
            onChangeText={setNewLimit}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <Button onPress={() => setModalVisible(false)}>Anulează</Button>
            <Button mode="contained" onPress={saveNewLimit}>
              Salvează
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appsList: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: colors.primary + '10',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  infoText: {
    color: colors.textSecondary,
  },
  syncContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncText: {
    color: colors.success,
    fontWeight: '600',
  },
  appCard: {
    marginBottom: 16,
    elevation: 2,
  },
  appHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  appIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  appName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  timeInfo: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeLabel: {
    color: colors.textSecondary,
  },
  timeValue: {
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  addButton: {
    marginTop: 24,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default AppsScreen;
