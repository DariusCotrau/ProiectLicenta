import { App, AppCategory } from '../types';
import StorageService from '../services/StorageService';

/**
 * Initialize the app with demo data for testing
 * This should be called on first launch
 */
export const initializeDemoData = async (): Promise<void> => {
  // Check if we already have data
  const existingApps = await StorageService.getApps();

  if (existingApps.length > 0) {
    console.log('Demo data already exists, skipping initialization');
    return;
  }

  // Create demo apps
  const demoApps: App[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      packageName: 'com.instagram.android',
      dailyLimit: 60, // 1 hour
      usedTime: 35, // 35 minutes used
      isBlocked: false,
      category: AppCategory.SOCIAL_MEDIA,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      packageName: 'com.facebook.katana',
      dailyLimit: 45,
      usedTime: 50, // Over limit, should be blocked
      isBlocked: true,
      category: AppCategory.SOCIAL_MEDIA,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      packageName: 'com.zhiliaoapp.musically',
      dailyLimit: 30,
      usedTime: 28, // Close to limit
      isBlocked: false,
      category: AppCategory.ENTERTAINMENT,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      packageName: 'com.google.android.youtube',
      dailyLimit: 90,
      usedTime: 45,
      isBlocked: false,
      category: AppCategory.ENTERTAINMENT,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      packageName: 'com.twitter.android',
      dailyLimit: 30,
      usedTime: 15,
      isBlocked: false,
      category: AppCategory.SOCIAL_MEDIA,
    },
  ];

  // Save demo apps
  await StorageService.saveApps(demoApps);

  // Initialize user stats
  await StorageService.updateUserStats({
    totalTasksCompleted: 12,
    totalTimeEarned: 360, // 6 hours earned
    totalTimeSaved: 120, // 2 hours saved
    currentStreak: 3,
    longestStreak: 7,
    tasksCompletedToday: 2,
  });

  // Initialize settings
  await StorageService.updateSettings({
    notificationsEnabled: true,
    strictMode: false,
    dailyGoal: 60,
    theme: 'auto',
  });

  console.log('Demo data initialized successfully');
};

/**
 * Reset all data and reinitialize with demo data
 */
export const resetToDemoData = async (): Promise<void> => {
  await StorageService.clearAll();
  await initializeDemoData();
  console.log('Data reset to demo values');
};
