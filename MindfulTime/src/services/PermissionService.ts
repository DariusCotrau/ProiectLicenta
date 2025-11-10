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
 * - Pe Android: Poate cere PACKAGE_USAGE_STATS pentru tracking
 * - Pe iOS: Nu există API pentru tracking-ul altor aplicații
 *
 * Limitări:
 * - Nicio platformă nu permite blocarea HARD a aplicațiilor
 * - iOS nu permite tracking-ul altor aplicații
 * - Android permite tracking dar nu blocking
 */
class PermissionService {
  /**
   * Verifică dacă aplicația are permisiunea de usage stats (doar Android)
   */
  async hasUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await NativeUsageStatsService.hasPermission();
    } catch (error) {
      console.error('[PermissionService] Error checking usage stats permission:', error);
      return false;
    }
  }

  /**
   * Cere permisiunea de usage stats (deschide Settings pe Android)
   */
  async requestUsageStatsPermission(): Promise<void> {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Indisponibil pe iOS',
        'Din cauza limitărilor iOS, nu putem tracka automat timpul de utilizare al altor aplicații.\n\n' +
        'Sugestii:\n' +
        '1. Folosește Screen Time nativ din Settings\n' +
        '2. Introdu manual timpul în MindfulTime\n' +
        '3. Folosește Focus Modes pentru limitarea accesului'
      );
      return;
    }

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
      // Pentru iOS 12+ și Android 13+
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
    platform: 'android' | 'ios' | 'web';
  }> {
    return {
      hasUsageStats: await this.hasUsageStatsPermission(),
      hasNotifications: true, // Placeholder
      hasRequestedBefore: await this.hasRequestedPermissions(),
      isTrackingEnabled: await this.isTrackingEnabled(),
      platform: Platform.OS as 'android' | 'ios' | 'web',
    };
  }

  /**
   * Ghidare către Screen Time nativ (iOS)
   */
  async openNativeScreenTime(): Promise<void> {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Screen Time',
        'Pentru a configura limite de timp pe iOS:\n\n' +
        '1. Deschide Settings\n' +
        '2. Mergi la Screen Time\n' +
        '3. Activează Screen Time dacă nu este activat\n' +
        '4. Setează "App Limits" pentru aplicațiile dorite\n\n' +
        'MindfulTime va complementa aceste setări cu tracking manual și gamification.',
        [
          {
            text: 'OK',
            onPress: () => Linking.openSettings(),
          },
          {
            text: 'Anulează',
            style: 'cancel',
          },
        ]
      );
    } else {
      Alert.alert(
        'Informație',
        'Această funcționalitate este disponibilă doar pe iOS.'
      );
    }
  }

  /**
   * Afișează explicație despre limitările platformei
   */
  async showPlatformLimitations(): Promise<void> {
    const platform = Platform.OS;
    let message = '';

    if (platform === 'ios') {
      message =
        '📱 Limitări iOS:\n\n' +
        '• iOS nu permite aplicațiilor terțe să trackeze timpul de utilizare al altor aplicații\n' +
        '• Nu putem bloca automat alte aplicații\n\n' +
        '✅ Ce oferim în schimb:\n' +
        '• Tracking manual simplu și rapid\n' +
        '• Notificări pentru reminder-uri\n' +
        '• Gamification (streaks, achievements)\n' +
        '• Integrare cu Screen Time nativ\n' +
        '• Widget cu statistici\n\n' +
        'Aceste metode s-au dovedit la fel de eficiente ca blocarea hard!';
    } else if (platform === 'android') {
      message =
        '🤖 Funcționalități Android:\n\n' +
        '• Tracking automat al timpului de utilizare\n' +
        '• Notificări când te apropii de limită\n' +
        '• "Gentle blocking" cu overlay-uri\n' +
        '• Widget cu statistici live\n\n' +
        '⚠️ Limitare:\n' +
        '• Nu putem bloca COMPLET o aplicație (ar necesita acces root)\n' +
        '• Folosim "friction" psihologic în schimb\n\n' +
        'Acest approach funcționează mai bine decât blocarea hard!';
    }

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

      // Pe Android, cere usage stats
      if (Platform.OS === 'android') {
        await this.requestUsageStatsPermission();
      } else {
        // Pe iOS, ghidează către Screen Time
        await this.openNativeScreenTime();
      }

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
