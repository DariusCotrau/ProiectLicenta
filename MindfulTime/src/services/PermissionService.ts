import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NativeUsageStatsService from './NativeUsageStatsService';

const STORAGE_KEYS = {
  PERMISSIONS_REQUESTED: '@mindfultime:permissions_requested',
  TRACKING_ENABLED: '@mindfultime:tracking_enabled',
};

/**
 * PermissionService - Gestionează permisiunile pentru tracking-ul aplicațiilor
 *
 * IMPORTANT:
 * - Aplicația este Android-only
 * - Poate cere PACKAGE_USAGE_STATS pentru tracking
 *
 * Limitări:
 * - Android nu permite blocarea HARD a aplicațiilor
 * - Android permite tracking dar nu blocking
 */
class PermissionService {
  /**
   * Verifică dacă aplicația are permisiunea de usage stats
   */
  async hasUsageStatsPermission(): Promise<boolean> {
    try {
      return await NativeUsageStatsService.hasPermission();
    } catch (error) {
      console.error('[PermissionService] Error checking usage stats permission:', error);
      return false;
    }
  }

  /**
   * Cere permisiunea de usage stats (deschide Settings)
   */
  async requestUsageStatsPermission(): Promise<void> {
    try {
      Alert.alert(
        'Permisiune Necesară',
        'Pentru a monitoriza timpul de utilizare, MindfulTime are nevoie de acces la "Usage Stats".\n\n' +
        'Pași:\n' +
        '1. Apasă OK pentru a deschide Settings\n' +
        '2. Găsește "MindfulTime" în listă\n' +
        '3. Activează permisiunea\n' +
        '4. Revino la aplicație',
        [
          {
            text: 'Anulează',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                await NativeUsageStatsService.requestPermission();
                await this.setPermissionsRequested(true);
              } catch (error) {
                console.error('[PermissionService] Error opening usage stats settings:', error);
                // Fallback to generic settings
                await Linking.openSettings();
                await this.setPermissionsRequested(true);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[PermissionService] Error requesting usage stats permission:', error);
      Alert.alert('Eroare', 'Nu s-a putut deschide ecranul de setări.');
    }
  }

  /**
   * Cere permisiunea de notificări
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      // Pentru Android 13+
      // const { Notifications } = require('expo-notifications');
      // const { status } = await Notifications.requestPermissionsAsync();
      // return status === 'granted';

      // PLACEHOLDER
      console.log('[PermissionService] requestNotificationPermission (placeholder)');
      return true;
    } catch (error) {
      console.error('[PermissionService] Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Verifică dacă utilizatorul a fost întrebat despre permisiuni
   */
  async hasRequestedPermissions(): Promise<boolean> {
    try {
      const requested = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS_REQUESTED);
      return requested === 'true';
    } catch (error) {
      console.error('[PermissionService] Error checking permissions requested:', error);
      return false;
    }
  }

  /**
   * Marchează că utilizatorul a fost întrebat despre permisiuni
   */
  async setPermissionsRequested(requested: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PERMISSIONS_REQUESTED,
        requested ? 'true' : 'false'
      );
    } catch (error) {
      console.error('[PermissionService] Error setting permissions requested:', error);
    }
  }

  /**
   * Verifică dacă tracking-ul este activat
   */
  async isTrackingEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.TRACKING_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('[PermissionService] Error checking tracking enabled:', error);
      return false;
    }
  }

  /**
   * Activează/dezactivează tracking-ul
   */
  async setTrackingEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRACKING_ENABLED,
        enabled ? 'true' : 'false'
      );
    } catch (error) {
      console.error('[PermissionService] Error setting tracking enabled:', error);
    }
  }

  /**
   * Obține statusul complet al permisiunilor
   */
  async getPermissionsStatus(): Promise<{
    hasUsageStats: boolean;
    hasNotifications: boolean;
    hasRequestedBefore: boolean;
    isTrackingEnabled: boolean;
    platform: 'android';
  }> {
    return {
      hasUsageStats: await this.hasUsageStatsPermission(),
      hasNotifications: true, // Placeholder
      hasRequestedBefore: await this.hasRequestedPermissions(),
      isTrackingEnabled: await this.isTrackingEnabled(),
      platform: 'android',
    };
  }

  /**
   * Afișează explicație despre limitările platformei
   */
  async showPlatformLimitations(): Promise<void> {
    const message =
      '🤖 Funcționalități Android:\n\n' +
      '• Tracking automat al timpului de utilizare\n' +
      '• Notificări când te apropii de limită\n' +
      '• "Gentle blocking" cu overlay-uri\n' +
      '• Widget cu statistici live\n\n' +
      '⚠️ Limitare:\n' +
      '• Nu putem bloca COMPLET o aplicație (ar necesita acces root)\n' +
      '• Folosim "friction" psihologic în schimb\n\n' +
      'Acest approach funcționează mai bine decât blocarea hard!';

    Alert.alert('Cum Funcționează MindfulTime', message);
  }

  /**
   * Inițializează setup-ul inițial de permisiuni
   */
  async performInitialSetup(): Promise<boolean> {
    try {
      const hasRequested = await this.hasRequestedPermissions();

      if (hasRequested) {
        return true; // Already set up
      }

      // Afișează screen de onboarding cu explicații
      await this.showPlatformLimitations();

      // Cere usage stats
      await this.requestUsageStatsPermission();

      // Cere permisiunea de notificări
      await this.requestNotificationPermission();

      await this.setPermissionsRequested(true);
      await this.setTrackingEnabled(true);

      return true;
    } catch (error) {
      console.error('[PermissionService] Error in initial setup:', error);
      return false;
    }
  }
}

export default new PermissionService();
