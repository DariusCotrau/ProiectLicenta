import AsyncStorage from '@react-native-async-storage/async-storage';
import { App, CompletedTask, UserStats, AppSettings, DailyUsage } from '../types';
import DatabaseService from '../database/DatabaseService';

const STORAGE_KEYS = {
  CURRENT_USER_ID: '@mindfultime:current_user_id',
};

/**
 * StorageService now acts as a wrapper around DatabaseService
 * It maintains backward compatibility while using the database
 */
class StorageService {
  private async getCurrentUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  // Apps Management
  async getApps(): Promise<App[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      return await DatabaseService.apps.getApps(userId);
    } catch (error) {
      console.error('Error getting apps:', error);
      return [];
    }
  }

  async saveApps(apps: App[]): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      await DatabaseService.apps.bulkUpdateApps(userId, apps);
    } catch (error) {
      console.error('Error saving apps:', error);
    }
  }

  async updateApp(appId: string, updates: Partial<App>): Promise<void> {
    try {
      await DatabaseService.apps.updateApp(appId, updates);
    } catch (error) {
      console.error('Error updating app:', error);
    }
  }

  // Completed Tasks Management
  async getCompletedTasks(): Promise<CompletedTask[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      return await DatabaseService.tasks.getCompletedTasks(userId);
    } catch (error) {
      console.error('Error getting completed tasks:', error);
      return [];
    }
  }

  async addCompletedTask(task: CompletedTask): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      await DatabaseService.tasks.completeTask(userId, task);
    } catch (error) {
      console.error('Error adding completed task:', error);
    }
  }

  async getTasksCompletedToday(): Promise<CompletedTask[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      return await DatabaseService.tasks.getCompletedTasksToday(userId);
    } catch (error) {
      console.error('Error getting tasks completed today:', error);
      return [];
    }
  }

  // User Stats Management
  async getUserStats(): Promise<UserStats> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          totalTasksCompleted: 0,
          totalTimeEarned: 0,
          totalTimeSaved: 0,
          currentStreak: 0,
          longestStreak: 0,
          tasksCompletedToday: 0,
        };
      }

      return await DatabaseService.users.getUserStats(userId);
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalTasksCompleted: 0,
        totalTimeEarned: 0,
        totalTimeSaved: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompletedToday: 0,
      };
    }
  }

  async updateUserStats(stats: Partial<UserStats>): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      await DatabaseService.users.updateUserStats(userId, stats);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Settings Management
  async getSettings(): Promise<AppSettings> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          notificationsEnabled: true,
          strictMode: false,
          dailyGoal: 60,
          theme: 'auto',
        };
      }

      return await DatabaseService.users.getUserSettings(userId);
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        notificationsEnabled: true,
        strictMode: false,
        dailyGoal: 60,
        theme: 'auto',
      };
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      await DatabaseService.users.updateUserSettings(userId, settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  // Daily Usage Management
  async getDailyUsage(date?: string): Promise<DailyUsage | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const dateKey = date || new Date().toDateString();
      return await DatabaseService.tasks.getDailyUsage(userId, dateKey);
    } catch (error) {
      console.error('Error getting daily usage:', error);
      return null;
    }
  }

  async updateDailyUsage(usage: DailyUsage): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      await DatabaseService.tasks.saveDailyUsage(userId, usage);
    } catch (error) {
      console.error('Error updating daily usage:', error);
    }
  }

  // Clear all data (useful for testing)
  async clearAll(): Promise<void> {
    try {
      await DatabaseService.reset();
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export default new StorageService();
