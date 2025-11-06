import AsyncStorage from '@react-native-async-storage/async-storage';
import { App, CompletedTask, UserStats, AppSettings, DailyUsage } from '../types';

const STORAGE_KEYS = {
  APPS: '@mindfultime:apps',
  COMPLETED_TASKS: '@mindfultime:completed_tasks',
  USER_STATS: '@mindfultime:user_stats',
  SETTINGS: '@mindfultime:settings',
  DAILY_USAGE: '@mindfultime:daily_usage',
};

class StorageService {
  // Apps Management
  async getApps(): Promise<App[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APPS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting apps:', error);
      return [];
    }
  }

  async saveApps(apps: App[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
    } catch (error) {
      console.error('Error saving apps:', error);
    }
  }

  async updateApp(appId: string, updates: Partial<App>): Promise<void> {
    const apps = await this.getApps();
    const index = apps.findIndex(app => app.id === appId);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...updates };
      await this.saveApps(apps);
    }
  }

  // Completed Tasks Management
  async getCompletedTasks(): Promise<CompletedTask[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting completed tasks:', error);
      return [];
    }
  }

  async addCompletedTask(task: CompletedTask): Promise<void> {
    try {
      const tasks = await this.getCompletedTasks();
      tasks.push(task);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error adding completed task:', error);
    }
  }

  async getTasksCompletedToday(): Promise<CompletedTask[]> {
    const tasks = await this.getCompletedTasks();
    const today = new Date().toDateString();
    return tasks.filter(task =>
      new Date(task.completedAt).toDateString() === today
    );
  }

  // User Stats Management
  async getUserStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      return data ? JSON.parse(data) : {
        totalTasksCompleted: 0,
        totalTimeEarned: 0,
        totalTimeSaved: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompletedToday: 0,
      };
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
      const currentStats = await this.getUserStats();
      const updatedStats = { ...currentStats, ...stats };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Settings Management
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        notificationsEnabled: true,
        strictMode: false,
        dailyGoal: 60, // 60 minutes default
        theme: 'auto',
      };
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
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  // Daily Usage Management
  async getDailyUsage(date?: string): Promise<DailyUsage | null> {
    try {
      const dateKey = date || new Date().toDateString();
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_USAGE}:${dateKey}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting daily usage:', error);
      return null;
    }
  }

  async updateDailyUsage(usage: DailyUsage): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.DAILY_USAGE}:${usage.date}`,
        JSON.stringify(usage)
      );
    } catch (error) {
      console.error('Error updating daily usage:', error);
    }
  }

  // Clear all data (useful for testing)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export default new StorageService();
