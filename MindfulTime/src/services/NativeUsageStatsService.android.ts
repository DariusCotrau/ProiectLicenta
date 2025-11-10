/**
 * Android implementation of NativeUsageStatsService
 * Uses native UsageStatsModule for real app usage tracking
 */

import { NativeModules } from 'react-native';
import type { INativeUsageStatsService, AppUsageStats, InstalledApp } from './NativeUsageStatsService.types';

const { UsageStatsModule } = NativeModules;

class NativeUsageStatsService implements INativeUsageStatsService {
  /**
   * Verifică dacă are permisiunea
   */
  async hasPermission(): Promise<boolean> {
    try {
      if (!UsageStatsModule) {
        console.warn('[Android] UsageStatsModule not available - native module not linked');
        return false;
      }
      return await UsageStatsModule.hasUsageStatsPermission();
    } catch (error) {
      console.error('[Android] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Cere permisiunea (deschide Settings)
   */
  async requestPermission(): Promise<void> {
    try {
      if (!UsageStatsModule) {
        throw new Error('[Android] UsageStatsModule not available - native module not linked');
      }
      await UsageStatsModule.requestUsageStatsPermission();
    } catch (error) {
      console.error('[Android] Error requesting permission:', error);
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
    try {
      if (!UsageStatsModule) {
        console.warn('[Android] UsageStatsModule not available - native module not linked');
        return [];
      }
      const stats = await UsageStatsModule.getUsageStats(startTime, endTime);
      return stats;
    } catch (error) {
      console.error('[Android] Error getting usage stats:', error);
      return [];
    }
  }

  /**
   * Obține aplicații instalate
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    try {
      if (!UsageStatsModule) {
        console.warn('[Android] UsageStatsModule not available - native module not linked');
        return [];
      }
      const apps = await UsageStatsModule.getInstalledApps();
      return apps;
    } catch (error) {
      console.error('[Android] Error getting installed apps:', error);
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
    return !!UsageStatsModule;
  }
}

export default new NativeUsageStatsService();
