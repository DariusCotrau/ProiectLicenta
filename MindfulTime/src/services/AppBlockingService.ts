import { NativeModules, Alert } from 'react-native';
import type { App } from '../types';

const { AppBlockingModule } = NativeModules;

/**
 * Service pentru gestionarea blocării aplicațiilor
 * Comunică cu codul nativ Android pentru monitorizare și blocare
 */
class AppBlockingService {
  /**
   * Verifică dacă aplicația are permisiunea de overlay
   */
  async hasOverlayPermission(): Promise<boolean> {
    try {
      if (!AppBlockingModule) {
        console.warn('[AppBlockingService] AppBlockingModule not available');
        return false;
      }
      return await AppBlockingModule.hasOverlayPermission();
    } catch (error) {
      console.error('[AppBlockingService] Error checking overlay permission:', error);
      return false;
    }
  }

  /**
   * Cere permisiunea de overlay
   */
  async requestOverlayPermission(): Promise<void> {
    try {
      if (!AppBlockingModule) {
        throw new Error('AppBlockingModule not available');
      }

      Alert.alert(
        'Permisiune Overlay Necesară',
        'Pentru a bloca aplicațiile când atingi limita, MindfulTime are nevoie să afișeze un overlay.\n\n' +
        'Pași:\n' +
        '1. Apasă OK pentru a deschide Settings\n' +
        '2. Activează "Display over other apps"\n' +
        '3. Revino la aplicație',
        [
          {
            text: 'Anulează',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await AppBlockingModule.requestOverlayPermission();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[AppBlockingService] Error requesting overlay permission:', error);
      Alert.alert('Eroare', 'Nu s-a putut deschide ecranul de setări.');
    }
  }

  /**
   * Verifică dacă Accessibility Service este activat
   */
  async hasAccessibilityPermission(): Promise<boolean> {
    try {
      if (!AppBlockingModule) {
        console.warn('[AppBlockingService] AppBlockingModule not available');
        return false;
      }
      return await AppBlockingModule.hasAccessibilityPermission();
    } catch (error) {
      console.error('[AppBlockingService] Error checking accessibility permission:', error);
      return false;
    }
  }

  /**
   * Cere activarea Accessibility Service
   */
  async requestAccessibilityPermission(): Promise<void> {
    try {
      if (!AppBlockingModule) {
        throw new Error('AppBlockingModule not available');
      }

      Alert.alert(
        'Permisiune Accessibility Necesară',
        'Pentru a monitoriza și bloca aplicațiile în timp real, MindfulTime are nevoie de Accessibility Service.\n\n' +
        'Pași:\n' +
        '1. Apasă OK pentru a deschide Settings\n' +
        '2. Găsește "MindfulTime" în listă\n' +
        '3. Activează service-ul\n' +
        '4. Revino la aplicație\n\n' +
        'Nota: Acest serviciu rulează doar local pe device-ul tău și nu transmite date nicăieri.',
        [
          {
            text: 'Anulează',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await AppBlockingModule.requestAccessibilityPermission();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[AppBlockingService] Error requesting accessibility permission:', error);
      Alert.alert('Eroare', 'Nu s-a putut deschide ecranul de setări.');
    }
  }

  /**
   * Setează lista de aplicații blocate
   */
  async setBlockedApps(apps: App[]): Promise<boolean> {
    try {
      if (!AppBlockingModule) {
        console.warn('[AppBlockingService] AppBlockingModule not available');
        return false;
      }

      // Filtrează doar aplicațiile blocate
      const blockedPackageNames = apps
        .filter(app => app.isBlocked)
        .map(app => app.packageName);

      const jsonString = JSON.stringify(blockedPackageNames);
      await AppBlockingModule.setBlockedApps(jsonString);
      console.log(`[AppBlockingService] Updated blocked apps: ${blockedPackageNames.length} apps`);
      return true;
    } catch (error) {
      console.error('[AppBlockingService] Error setting blocked apps:', error);
      return false;
    }
  }

  /**
   * Activează/dezactivează blocarea aplicațiilor
   */
  async setBlockingEnabled(enabled: boolean): Promise<boolean> {
    try {
      if (!AppBlockingModule) {
        console.warn('[AppBlockingService] AppBlockingModule not available');
        return false;
      }

      await AppBlockingModule.setBlockingEnabled(enabled);
      console.log(`[AppBlockingService] Blocking ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('[AppBlockingService] Error setting blocking enabled:', error);
      return false;
    }
  }

  /**
   * Verifică dacă blocarea este activată
   */
  async isBlockingEnabled(): Promise<boolean> {
    try {
      if (!AppBlockingModule) {
        return false;
      }
      return await AppBlockingModule.isBlockingEnabled();
    } catch (error) {
      console.error('[AppBlockingService] Error checking blocking enabled:', error);
      return false;
    }
  }

  /**
   * Verifică toate permisiunile necesare pentru blocare
   */
  async checkAllPermissions(): Promise<{
    hasOverlay: boolean;
    hasAccessibility: boolean;
    allGranted: boolean;
  }> {
    try {
      if (!AppBlockingModule) {
        return {
          hasOverlay: false,
          hasAccessibility: false,
          allGranted: false,
        };
      }

      return await AppBlockingModule.checkAllBlockingPermissions();
    } catch (error) {
      console.error('[AppBlockingService] Error checking all permissions:', error);
      return {
        hasOverlay: false,
        hasAccessibility: false,
        allGranted: false,
      };
    }
  }

  /**
   * Verifică dacă modulul este disponibil
   */
  isAvailable(): boolean {
    return !!AppBlockingModule;
  }
}

export default new AppBlockingService();
