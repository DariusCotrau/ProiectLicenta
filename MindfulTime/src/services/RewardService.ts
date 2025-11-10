import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RewardBalance,
  RewardTransaction,
  Achievement,
  StreakBonus,
  RewardAllocation,
  TaskCategory,
  MindfulTask,
} from '../types';
import StorageService from './StorageService';

// Storage keys
const STORAGE_KEYS = {
  REWARD_BALANCE: '@mindfultime:reward_balance',
  REWARD_TRANSACTIONS: '@mindfultime:reward_transactions',
  ACHIEVEMENTS: '@mindfultime:achievements',
  REWARD_ALLOCATIONS: '@mindfultime:reward_allocations',
};

// Streak bonuses configuration
const STREAK_BONUSES: StreakBonus[] = [
  { days: 3, multiplier: 1.1, description: '10% bonus pentru 3 zile consecutive' },
  { days: 7, multiplier: 1.25, description: '25% bonus pentru 1 săptămână' },
  { days: 14, multiplier: 1.5, description: '50% bonus pentru 2 săptămâni' },
  { days: 30, multiplier: 2.0, description: '100% bonus pentru 1 lună' },
];

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    title: 'Primul Pas',
    description: 'Completează prima activitate',
    icon: 'star',
    requirement: 1,
    type: 'tasks_completed',
    unlocked: false,
    rewardBonus: 10,
  },
  {
    id: 'task_master_10',
    title: 'Începător Dedicat',
    description: 'Completează 10 activități',
    icon: 'trophy',
    requirement: 10,
    type: 'tasks_completed',
    unlocked: false,
    rewardBonus: 30,
  },
  {
    id: 'task_master_50',
    title: 'Expert Mindfulness',
    description: 'Completează 50 activități',
    icon: 'emoji-events',
    requirement: 50,
    type: 'tasks_completed',
    unlocked: false,
    rewardBonus: 100,
  },
  {
    id: 'time_earner_100',
    title: 'Câștigător de Timp',
    description: 'Câștigă 100 minute',
    icon: 'access-time',
    requirement: 100,
    type: 'time_earned',
    unlocked: false,
    rewardBonus: 20,
  },
  {
    id: 'time_earner_500',
    title: 'Maestru Temporal',
    description: 'Câștigă 500 minute',
    icon: 'schedule',
    requirement: 500,
    type: 'time_earned',
    unlocked: false,
    rewardBonus: 50,
  },
  {
    id: 'streak_7',
    title: 'Săptămâna Perfectă',
    description: 'Menține un streak de 7 zile',
    icon: 'local-fire-department',
    requirement: 7,
    type: 'streak',
    unlocked: false,
    rewardBonus: 50,
  },
  {
    id: 'streak_30',
    title: 'Luna Disciplinei',
    description: 'Menține un streak de 30 zile',
    icon: 'whatshot',
    requirement: 30,
    type: 'streak',
    unlocked: false,
    rewardBonus: 200,
  },
  {
    id: 'outdoor_master',
    title: 'Iubitor de Natură',
    description: 'Completează 20 activități outdoor',
    icon: 'park',
    requirement: 20,
    type: 'category_master',
    category: TaskCategory.OUTDOOR,
    unlocked: false,
    rewardBonus: 40,
  },
  {
    id: 'meditation_master',
    title: 'Maestru Zen',
    description: 'Completează 20 sesiuni de meditație',
    icon: 'self-improvement',
    requirement: 20,
    type: 'category_master',
    category: TaskCategory.MEDITATION,
    unlocked: false,
    rewardBonus: 40,
  },
];

class RewardService {
  /**
   * Initialize reward system with default values
   */
  async initialize(): Promise<void> {
    const balance = await this.getRewardBalance();
    if (!balance) {
      await this.resetRewardBalance();
    }

    const achievements = await this.getAchievements();
    if (!achievements || achievements.length === 0) {
      await this.initializeAchievements();
    }
  }

  /**
   * Get current reward balance
   */
  async getRewardBalance(): Promise<RewardBalance> {
    try {
      const balanceJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARD_BALANCE);
      if (!balanceJson) {
        return this.resetRewardBalance();
      }
      return JSON.parse(balanceJson);
    } catch (error) {
      console.error('Error getting reward balance:', error);
      return this.resetRewardBalance();
    }
  }

  /**
   * Reset reward balance to default
   */
  private async resetRewardBalance(): Promise<RewardBalance> {
    const defaultBalance: RewardBalance = {
      totalEarned: 0,
      available: 0,
      spent: 0,
      pendingAllocation: 0,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.REWARD_BALANCE, JSON.stringify(defaultBalance));
    return defaultBalance;
  }

  /**
   * Update reward balance
   */
  private async updateRewardBalance(updates: Partial<RewardBalance>): Promise<void> {
    const currentBalance = await this.getRewardBalance();
    const newBalance = { ...currentBalance, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.REWARD_BALANCE, JSON.stringify(newBalance));
  }

  /**
   * Add earned time reward
   */
  async addEarnedTime(
    minutes: number,
    task: MindfulTask,
    applyStreakBonus: boolean = true
  ): Promise<{ finalAmount: number; bonusApplied: number }> {
    let finalAmount = minutes;
    let bonusApplied = 0;

    // Apply streak bonus if applicable
    if (applyStreakBonus) {
      const stats = await StorageService.getUserStats();
      const bonus = this.getStreakBonus(stats.currentStreak);
      if (bonus) {
        bonusApplied = Math.floor(minutes * (bonus.multiplier - 1));
        finalAmount = Math.floor(minutes * bonus.multiplier);
      }
    }

    // Update balance
    const balance = await this.getRewardBalance();
    await this.updateRewardBalance({
      totalEarned: balance.totalEarned + finalAmount,
      available: balance.available + finalAmount,
      pendingAllocation: balance.pendingAllocation + finalAmount,
    });

    // Record transaction
    await this.addTransaction({
      id: `earn_${Date.now()}`,
      type: 'earned',
      amount: finalAmount,
      reason: `Completat: ${task.title}`,
      taskId: task.id,
      timestamp: new Date(),
      description: bonusApplied > 0
        ? `${minutes} minute + ${bonusApplied} bonus streak`
        : `${minutes} minute`,
    });

    // Check achievements
    await this.checkAndUnlockAchievements();

    return { finalAmount, bonusApplied };
  }

  /**
   * Spend time reward (allocate to app)
   */
  async spendTime(appId: string, appName: string, minutes: number): Promise<boolean> {
    const balance = await this.getRewardBalance();

    if (balance.available < minutes) {
      return false; // Not enough available time
    }

    // Update balance
    await this.updateRewardBalance({
      available: balance.available - minutes,
      spent: balance.spent + minutes,
      pendingAllocation: Math.max(0, balance.pendingAllocation - minutes),
    });

    // Record transaction
    await this.addTransaction({
      id: `spend_${Date.now()}`,
      type: 'spent',
      amount: minutes,
      reason: `Alocat către ${appName}`,
      appId,
      timestamp: new Date(),
      description: `${minutes} minute alocate`,
    });

    // Record allocation
    await this.addAllocation({
      appId,
      minutes,
      allocatedAt: new Date(),
    });

    return true;
  }

  /**
   * Get streak bonus for current streak
   */
  getStreakBonus(streakDays: number): StreakBonus | null {
    // Find the highest applicable bonus
    const applicableBonuses = STREAK_BONUSES.filter(bonus => streakDays >= bonus.days);
    if (applicableBonuses.length === 0) return null;
    return applicableBonuses[applicableBonuses.length - 1];
  }

  /**
   * Get all streak bonuses
   */
  getAllStreakBonuses(): StreakBonus[] {
    return STREAK_BONUSES;
  }

  /**
   * Get reward transactions
   */
  async getTransactions(limit?: number): Promise<RewardTransaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARD_TRANSACTIONS);
      if (!transactionsJson) return [];

      let transactions: RewardTransaction[] = JSON.parse(transactionsJson);
      // Convert timestamp strings back to Date objects
      transactions = transactions.map(t => ({
        ...t,
        timestamp: new Date(t.timestamp),
      }));

      // Sort by most recent first
      transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return limit ? transactions.slice(0, limit) : transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  /**
   * Add a transaction
   */
  private async addTransaction(transaction: RewardTransaction): Promise<void> {
    const transactions = await this.getTransactions();
    transactions.unshift(transaction);

    // Keep only last 100 transactions
    const trimmedTransactions = transactions.slice(0, 100);
    await AsyncStorage.setItem(
      STORAGE_KEYS.REWARD_TRANSACTIONS,
      JSON.stringify(trimmedTransactions)
    );
  }

  /**
   * Get achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    try {
      const achievementsJson = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!achievementsJson) return [];

      let achievements: Achievement[] = JSON.parse(achievementsJson);
      // Convert date strings back to Date objects
      achievements = achievements.map(a => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
      }));

      return achievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  /**
   * Initialize achievements with defaults
   */
  private async initializeAchievements(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(DEFAULT_ACHIEVEMENTS));
  }

  /**
   * Check and unlock achievements
   */
  async checkAndUnlockAchievements(): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const stats = await StorageService.getUserStats();
    const completedTasks = await StorageService.getCompletedTasks();

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of achievements) {
      if (achievement.unlocked) continue;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'tasks_completed':
          shouldUnlock = stats.totalTasksCompleted >= achievement.requirement;
          break;

        case 'time_earned':
          shouldUnlock = stats.totalTimeEarned >= achievement.requirement;
          break;

        case 'streak':
          shouldUnlock = stats.currentStreak >= achievement.requirement;
          break;

        case 'category_master':
          if (achievement.category) {
            const categoryTasks = completedTasks.filter(ct => {
              // We would need to lookup the task by ID to check category
              // For simplicity, we'll track this separately
              return true; // Placeholder
            });
            shouldUnlock = categoryTasks.length >= achievement.requirement;
          }
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);

        // Add bonus reward
        if (achievement.rewardBonus && achievement.rewardBonus > 0) {
          const balance = await this.getRewardBalance();
          await this.updateRewardBalance({
            totalEarned: balance.totalEarned + achievement.rewardBonus,
            available: balance.available + achievement.rewardBonus,
          });

          await this.addTransaction({
            id: `bonus_${Date.now()}`,
            type: 'bonus',
            amount: achievement.rewardBonus,
            reason: `Achievement debloc at: ${achievement.title}`,
            timestamp: new Date(),
            description: `Bonus ${achievement.rewardBonus} minute`,
          });
        }
      }
    }

    // Save updated achievements
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

    return newlyUnlocked;
  }

  /**
   * Get allocations
   */
  async getAllocations(): Promise<RewardAllocation[]> {
    try {
      const allocationsJson = await AsyncStorage.getItem(STORAGE_KEYS.REWARD_ALLOCATIONS);
      if (!allocationsJson) return [];

      let allocations: RewardAllocation[] = JSON.parse(allocationsJson);
      allocations = allocations.map(a => ({
        ...a,
        allocatedAt: new Date(a.allocatedAt),
      }));

      return allocations;
    } catch (error) {
      console.error('Error getting allocations:', error);
      return [];
    }
  }

  /**
   * Add allocation
   */
  private async addAllocation(allocation: RewardAllocation): Promise<void> {
    const allocations = await this.getAllocations();
    allocations.push(allocation);
    await AsyncStorage.setItem(STORAGE_KEYS.REWARD_ALLOCATIONS, JSON.stringify(allocations));
  }

  /**
   * Get stats summary for display
   */
  async getRewardsSummary(): Promise<{
    balance: RewardBalance;
    recentTransactions: RewardTransaction[];
    unlockedAchievements: Achievement[];
    currentStreakBonus: StreakBonus | null;
  }> {
    const balance = await this.getRewardBalance();
    const recentTransactions = await this.getTransactions(10);
    const achievements = await this.getAchievements();
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const stats = await StorageService.getUserStats();
    const currentStreakBonus = this.getStreakBonus(stats.currentStreak);

    return {
      balance,
      recentTransactions,
      unlockedAchievements,
      currentStreakBonus,
    };
  }
}

export default new RewardService();
