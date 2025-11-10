// Type definitions for the MindfulTime app

export interface App {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
  dailyLimit: number; // in minutes
  usedTime: number; // in minutes
  isBlocked: boolean;
  category?: AppCategory;
}

export enum AppCategory {
  SOCIAL_MEDIA = 'social_media',
  ENTERTAINMENT = 'entertainment',
  GAMES = 'games',
  PRODUCTIVITY = 'productivity',
  OTHER = 'other',
}

export interface MindfulTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  timeReward: number; // minutes earned for completion
  icon: string;
  requiresPhoto: boolean;
  isCustom?: boolean;
}

export enum TaskCategory {
  OUTDOOR = 'outdoor',
  READING = 'reading',
  EXERCISE = 'exercise',
  MEDITATION = 'meditation',
  CREATIVE = 'creative',
  SOCIAL = 'social',
  CUSTOM = 'custom',
}

export interface CompletedTask {
  id: string;
  taskId: string;
  completedAt: Date;
  photoUri?: string;
  timeEarned: number;
  notes?: string;
}

export interface UserStats {
  totalTasksCompleted: number;
  totalTimeEarned: number;
  totalTimeSaved: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
}

export interface DailyUsage {
  date: string;
  appUsage: Record<string, number>; // packageName -> minutes
  tasksCompleted: number;
  timeEarned: number;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  strictMode: boolean; // blocks apps immediately when limit reached
  dailyGoal: number; // minutes of mindful activities
  theme: 'light' | 'dark' | 'auto';
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Reward System types
export interface RewardBalance {
  totalEarned: number; // Total time ever earned
  available: number; // Available time to spend
  spent: number; // Time already allocated to apps
  pendingAllocation: number; // Time waiting to be allocated
}

export interface RewardTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus';
  amount: number; // minutes
  reason: string;
  taskId?: string;
  appId?: string;
  timestamp: Date;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number; // e.g., tasks completed, time earned
  type: 'tasks_completed' | 'time_earned' | 'streak' | 'category_master';
  category?: TaskCategory;
  unlocked: boolean;
  unlockedAt?: Date;
  rewardBonus?: number; // Bonus minutes for unlocking
}

export interface StreakBonus {
  days: number;
  multiplier: number; // e.g., 1.5 for 50% bonus
  description: string;
}

export interface RewardAllocation {
  appId: string;
  minutes: number;
  allocatedAt: Date;
}
