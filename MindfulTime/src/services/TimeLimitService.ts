import { App } from '../types';
import StorageService from './StorageService';

class TimeLimitService {
  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring app usage
   */
  startMonitoring(): void {
    // Update every minute
    this.updateInterval = setInterval(() => {
      this.checkAppLimits();
    }, 60000); // 60 seconds

    // Initial check
    this.checkAppLimits();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Check if any apps have exceeded their time limits
   */
  private async checkAppLimits(): Promise<void> {
    const apps = await StorageService.getApps();

    apps.forEach(app => {
      if (app.usedTime >= app.dailyLimit && !app.isBlocked) {
        this.blockApp(app.id);
      }
    });
  }

  /**
   * Block an app when it reaches its time limit
   */
  async blockApp(appId: string): Promise<void> {
    await StorageService.updateApp(appId, { isBlocked: true });
    // TODO: Implement actual app blocking via native modules
    // This will require platform-specific implementation
    console.log(`App ${appId} has been blocked`);
  }

  /**
   * Unblock an app
   */
  async unblockApp(appId: string): Promise<void> {
    await StorageService.updateApp(appId, { isBlocked: false });
    console.log(`App ${appId} has been unblocked`);
  }

  /**
   * Add time to an app's daily limit (reward for completing tasks)
   */
  async addTimeToApp(appId: string, minutes: number): Promise<void> {
    const apps = await StorageService.getApps();
    const app = apps.find(a => a.id === appId);

    if (app) {
      const newLimit = app.dailyLimit + minutes;
      await StorageService.updateApp(appId, { dailyLimit: newLimit });

      // If app was blocked and now has more time available, unblock it
      if (app.isBlocked && app.usedTime < newLimit) {
        await this.unblockApp(appId);
      }
    }
  }

  /**
   * Distribute earned time across all blocked or nearly-blocked apps
   */
  async distributeEarnedTime(earnedMinutes: number): Promise<void> {
    const apps = await StorageService.getApps();
    const blockedOrNearLimit = apps.filter(
      app => app.isBlocked || app.usedTime >= app.dailyLimit * 0.9
    );

    if (blockedOrNearLimit.length === 0) {
      // No apps need time, distribute equally
      const timePerApp = Math.floor(earnedMinutes / apps.length);
      for (const app of apps) {
        await this.addTimeToApp(app.id, timePerApp);
      }
    } else {
      // Distribute to blocked or nearly blocked apps
      const timePerApp = Math.floor(earnedMinutes / blockedOrNearLimit.length);
      for (const app of blockedOrNearLimit) {
        await this.addTimeToApp(app.id, timePerApp);
      }
    }
  }

  /**
   * Reset daily usage for all apps (should be called at midnight)
   */
  async resetDailyUsage(): Promise<void> {
    const apps = await StorageService.getApps();
    const resetApps = apps.map(app => ({
      ...app,
      usedTime: 0,
      isBlocked: false,
    }));
    await StorageService.saveApps(resetApps);
  }

  /**
   * Get remaining time for an app
   */
  async getRemainingTime(appId: string): Promise<number> {
    const apps = await StorageService.getApps();
    const app = apps.find(a => a.id === appId);
    return app ? Math.max(0, app.dailyLimit - app.usedTime) : 0;
  }

  /**
   * Update app usage time
   */
  async updateUsageTime(appId: string, minutesUsed: number): Promise<void> {
    const apps = await StorageService.getApps();
    const app = apps.find(a => a.id === appId);

    if (app) {
      const newUsedTime = app.usedTime + minutesUsed;
      await StorageService.updateApp(appId, { usedTime: newUsedTime });

      // Check if we should block the app
      if (newUsedTime >= app.dailyLimit) {
        await this.blockApp(appId);
      }
    }
  }
}

export default new TimeLimitService();
