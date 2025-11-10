import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PermissionService from '../services/PermissionService';
import { Theme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import {
  Container,
  Card,
  Text,
  Button,
  Row,
  Column,
  Spacer,
} from '../components/common';

interface PermissionsSetupScreenProps {
  navigation: any;
  onComplete?: () => void;
}

const PermissionsSetupScreen: React.FC<PermissionsSetupScreenProps> = ({
  navigation,
  onComplete,
}) => {
  const [hasUsageStats, setHasUsageStats] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { isTablet, getIconSize } = useResponsive();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await PermissionService.getPermissionsStatus();
    setHasUsageStats(status.hasUsageStats);
  };

  const handleRequestUsageStats = async () => {
    setIsLoading(true);
    await PermissionService.requestUsageStatsPermission();
    // Așteaptă 2 secunde pentru ca userul să revină din settings
    setTimeout(async () => {
      await checkPermissions();
      setIsLoading(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleRequestNotifications = async () => {
    setIsLoading(true);
    await PermissionService.requestNotificationPermission();
    setIsLoading(false);
    setCurrentStep(3);
  };

  const handleComplete = async () => {
    await PermissionService.setPermissionsRequested(true);
    await PermissionService.setTrackingEnabled(true);

    if (onComplete) {
      onComplete();
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = async () => {
    await PermissionService.setPermissionsRequested(true);
    await PermissionService.setTrackingEnabled(false);

    if (onComplete) {
      onComplete();
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Container padding>
        <Spacer size="xl" />

        {/* Header */}
        <Column align="center">
          <MaterialCommunityIcons
            name="shield-check"
            size={isTablet ? 100 : 80}
            color={Theme.colors.primary}
          />
          <Spacer size="lg" />
          <Text variant="h2" weight="bold" align="center">
            Configurare Permisiuni
          </Text>
          <Spacer size="sm" />
          <Text variant="body2" color={Theme.colors.textSecondary} align="center">
            Pentru a-ți urmări progresul, avem nevoie de câteva permisiuni
          </Text>
        </Column>

        <Spacer size="xxl" />

        {/* Step 1: Usage Stats */}
        <Card>
              <Column>
                <Row align="center">
                  <View
                    style={[
                      styles.stepNumber,
                      hasUsageStats && styles.stepNumberCompleted,
                    ]}
                  >
                    {hasUsageStats ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={24}
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text variant="h3" weight="bold" color="#FFFFFF">
                        1
                      </Text>
                    )}
                  </View>
                  <Spacer size="md" />
                  <Column style={{ flex: 1 }}>
                    <Text variant="h4" weight="600">
                      Acces la Statistici Utilizare
                    </Text>
                    <Text variant="caption" color={Theme.colors.textSecondary}>
                      {hasUsageStats ? 'Activat ✓' : 'Necesar'}
                    </Text>
                  </Column>
                </Row>

                <Spacer size="md" />

                <Text variant="body2" color={Theme.colors.textSecondary}>
                  Această permisiune ne permite să vedem cât timp petreci în fiecare
                  aplicație.
                </Text>

                <Spacer size="sm" />

                <View style={styles.benefitsBox}>
                  <Row align="center">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Theme.colors.success}
                    />
                    <Spacer size="sm" />
                    <Text variant="body2" style={{ flex: 1 }}>
                      Tracking automat al timpului
                    </Text>
                  </Row>
                  <Spacer size="xs" />
                  <Row align="center">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Theme.colors.success}
                    />
                    <Spacer size="sm" />
                    <Text variant="body2" style={{ flex: 1 }}>
                      Rapoarte detaliate pe aplicație
                    </Text>
                  </Row>
                  <Spacer size="xs" />
                  <Row align="center">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Theme.colors.success}
                    />
                    <Spacer size="sm" />
                    <Text variant="body2" style={{ flex: 1 }}>
                      Notificări când te apropii de limită
                    </Text>
                  </Row>
                </View>

                {!hasUsageStats && (
                  <>
                    <Spacer size="lg" />
                    <Button
                      title="Activează Acces"
                      onPress={handleRequestUsageStats}
                      variant="primary"
                      loading={isLoading}
                      disabled={isLoading}
                      fullWidth
                    />
                  </>
                )}
              </Column>
            </Card>

        <Spacer size="lg" />

        {/* Step 2: Notifications */}
        <Card>
          <Column>
            <Row align="center">
              <View style={styles.stepNumber}>
                <Text variant="h3" weight="bold" color="#FFFFFF">
                  2
                </Text>
              </View>
              <Spacer size="md" />
              <Column style={{ flex: 1 }}>
                <Text variant="h4" weight="600">
                  Notificări
                </Text>
                <Text variant="caption" color={Theme.colors.textSecondary}>
                  Recomandat
                </Text>
              </Column>
            </Row>

            <Spacer size="md" />

            <Text variant="body2" color={Theme.colors.textSecondary}>
              Primește notificări pentru:
            </Text>

            <Spacer size="sm" />

            <View style={styles.benefitsBox}>
              <Row align="center">
                <MaterialCommunityIcons
                  name="bell-ring"
                  size={20}
                  color={Theme.colors.warning}
                />
                <Spacer size="sm" />
                <Text variant="body2" style={{ flex: 1 }}>
                  Avertismente când te apropii de limită
                </Text>
              </Row>
              <Spacer size="xs" />
              <Row align="center">
                <MaterialCommunityIcons
                  name="trophy"
                  size={20}
                  color={Theme.colors.secondary}
                />
                <Spacer size="sm" />
                <Text variant="body2" style={{ flex: 1 }}>
                  Achievement-uri deblocate
                </Text>
              </Row>
              <Spacer size="xs" />
              <Row align="center">
                <MaterialCommunityIcons
                  name="fire"
                  size={20}
                  color={Theme.colors.warning}
                />
                <Spacer size="sm" />
                <Text variant="body2" style={{ flex: 1 }}>
                  Reminder-uri pentru menținerea streak-ului
                </Text>
              </Row>
            </View>

            <Spacer size="lg" />

            <Button
              title="Activează Notificări"
              onPress={handleRequestNotifications}
              variant="primary"
              loading={isLoading && currentStep === 2}
              disabled={isLoading}
              fullWidth
            />
          </Column>
        </Card>

        <Spacer size="xl" />

        {/* How it works */}
        <Card style={{ backgroundColor: Theme.colors.success + '10' }}>
          <Column>
            <Row align="center">
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={32}
                color={Theme.colors.success}
              />
              <Spacer size="md" />
              <Text variant="h4" weight="600" style={{ flex: 1 }}>
                Cum Funcționează
              </Text>
            </Row>

            <Spacer size="md" />

            <Text variant="body2" color={Theme.colors.textSecondary}>
              MindfulTime folosește o abordare <Text weight="600">"Gentle Blocking"</Text>
              {' '}- în loc să blocheze complet aplicațiile, creăm "friction"
              psihologic care te ajută să faci alegeri mai conștiente.
            </Text>

            <Spacer size="md" />

            <Text variant="body2" weight="600">
              Tehnicile noastre:
            </Text>

            <Spacer size="sm" />

            <Text variant="body2" color={Theme.colors.textSecondary}>
              • Notificări când depășești limita{'\n'}
              • Statistici vizibile care te motivează{'\n'}
              • Streak-uri care te fac să nu vrei să renunți{'\n'}
              • Achievement-uri care recompensează progresul{'\n'}
              • Gamification în loc de blocări hard
            </Text>

            <Spacer size="md" />

            <Text variant="caption" color={Theme.colors.textSecondary} style={{ fontStyle: 'italic' }}>
              Studiile arată că această metodă funcționează mai bine decât blocarea
              completă, deoarece îți dezvolți auto-controlul în loc să te bazezi pe
              restricții externe.
            </Text>
          </Column>
        </Card>

        <Spacer size="xl" />

        {/* Action Buttons */}
        <Button
          title="Gata, Începe!"
          onPress={handleComplete}
          variant="primary"
          size="lg"
          fullWidth
        />

        <Spacer size="md" />

        <Button
          title="Sar Peste (Nu Recomandăm)"
          onPress={handleSkip}
          variant="text"
          fullWidth
        />

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
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberCompleted: {
    backgroundColor: Theme.colors.success,
  },
  benefitsBox: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});

export default PermissionsSetupScreen;
