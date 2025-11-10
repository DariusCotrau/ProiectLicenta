/**
 * iOS stub implementation of NativeUsageStatsService
 * iOS doesn't allow third-party apps to track usage of other apps
 *
 * This implementation returns empty/false values to maintain
 * interface compatibility with Android version
 */

import type { INativeUsageStatsService, AppUsageStats, InstalledApp } from './NativeUsageStatsService.types';

class NativeUsageStatsService implements INativeUsageStatsService {
  /**
   * iOS doesn't have usage stats permission - always returns false
   */
  async hasPermission(): Promise<boolean> {
    console.log('[iOS] Usage stats not supported on iOS');
    return false;
  }

  /**
   * iOS doesn't support usage stats - this is a no-op
   * Users should be directed to native Screen Time instead
   */
  async requestPermission(): Promise<void> {
    console.log('[iOS] Usage stats not supported - use Screen Time instead');
    // No-op - iOS doesn't have this capability
    // User should be shown guidance to use Screen Time
  }

  /**
   * iOS doesn't allow tracking other apps - returns empty array
   */
  async getUsageStats(
    startTime: number,
    endTime: number
  ): Promise<AppUsageStats[]> {
    console.log('[iOS] getUsageStats not supported on iOS');
    return [];
  }

  /**
   * iOS doesn't allow querying other installed apps - returns empty array
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    console.log('[iOS] getInstalledApps not supported on iOS');
    return [];
  }

  /**
   * iOS doesn't support usage stats - returns empty array
   */
  async getTodayUsageStats(): Promise<AppUsageStats[]> {
    console.log('[iOS] getTodayUsageStats not supported on iOS');
    return [];
  }

  /**
   * Always returns false on iOS - this feature is not available
   */
  isAvailable(): boolean {
    return false;
  }
}

export default new NativeUsageStatsService();
