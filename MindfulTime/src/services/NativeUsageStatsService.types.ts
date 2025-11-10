/**
 * Shared TypeScript types for NativeUsageStatsService
 * Used by both Android and iOS implementations
 */

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

/**
 * Interface for NativeUsageStatsService
 * Must be implemented by both .android.ts and .ios.ts
 */
export interface INativeUsageStatsService {
  /**
   * Verifică dacă are permisiunea
   */
  hasPermission(): Promise<boolean>;

  /**
   * Cere permisiunea (deschide Settings)
   */
  requestPermission(): Promise<void>;

  /**
   * Obține statistici de utilizare
   */
  getUsageStats(startTime: number, endTime: number): Promise<AppUsageStats[]>;

  /**
   * Obține aplicații instalate
   */
  getInstalledApps(): Promise<InstalledApp[]>;

  /**
   * Obține statistici pentru azi
   */
  getTodayUsageStats(): Promise<AppUsageStats[]>;

  /**
   * Verifică dacă module-ul nativ este disponibil
   */
  isAvailable(): boolean;
}
