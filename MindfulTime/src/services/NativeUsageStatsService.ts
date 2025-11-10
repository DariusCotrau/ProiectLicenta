import { NativeModules, Platform } from 'react-native';

const { UsageStatsModule } = NativeModules;

export interface AppUsageStats {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // milliseconds
  lastTimeUsed: number; // timestamp
  lastTimeVisible: number;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
}

class NativeUsageStatsService {
  /**
   * Verifică dacă are permisiunea
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      if (!UsageStatsModule) {
        console.warn('UsageStatsModule not available - native module not linked');
        return false;
      }
      return await UsageStatsModule.hasUsageStatsPermission();
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Cere permisiunea (deschide Settings)
   */
  async requestPermission(): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android');
    }

    try {
      if (!UsageStatsModule) {
        throw new Error('UsageStatsModule not available - native module not linked');
      }
      await UsageStatsModule.requestUsageStatsPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    }
  }

  /**
   * Obține statistici de utilizare
   */
  async getUsageStats(
    startTime: number,
    endTime: number
  ): Promise<AppUsageStats[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      if (!UsageStatsModule) {
        console.warn('UsageStatsModule not available - native module not linked');
        return [];
      }
      const stats = await UsageStatsModule.getUsageStats(startTime, endTime);
      return stats;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return [];
    }
  }

  /**
   * Obține aplicații instalate
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      if (!UsageStatsModule) {
        console.warn('UsageStatsModule not available - native module not linked');
        return [];
      }
      const apps = await UsageStatsModule.getInstalledApps();
      return apps;
    } catch (error) {
      console.error('Error getting installed apps:', error);
      return [];
    }
  }

  /**
   * Obține statistici pentru azi
   */
  async getTodayUsageStats(): Promise<AppUsageStats[]> {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.getUsageStats(startOfDay.getTime(), now);
  }

  /**
   * Verifică dacă module-ul nativ este disponibil
   */
  isAvailable(): boolean {
    return Platform.OS === 'android' && !!UsageStatsModule;
  }
}

export default new NativeUsageStatsService();
