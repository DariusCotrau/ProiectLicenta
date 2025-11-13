import * as SQLite from 'expo-sqlite';
import { RewardTransaction, RewardBalance, RewardAllocation, Achievement } from '../../types';

/**
 * Repository for reward-related database operations
 */
export class RewardRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  /**
   * Create a reward transaction
   */
  async createTransaction(userId: string, transaction: RewardTransaction): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO reward_transactions (
        id, user_id, type, amount, reason, task_id, app_id, timestamp, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        userId,
        transaction.type,
        transaction.amount,
        transaction.reason,
        transaction.taskId || null,
        transaction.appId || null,
        transaction.timestamp.getTime(),
        transaction.description,
      ]
    );
  }

  /**
   * Get all transactions for a user
   */
  async getTransactions(userId: string, limit?: number): Promise<RewardTransaction[]> {
    let query = 'SELECT * FROM reward_transactions WHERE user_id = ? ORDER BY timestamp DESC';
    const params: any[] = [userId];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const results = await this.db.getAllAsync<any>(query, params);
    return results.map(this.mapRowToTransaction);
  }

  /**
   * Get transactions by type
   */
  async getTransactionsByType(userId: string, type: 'earned' | 'spent' | 'bonus'): Promise<RewardTransaction[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM reward_transactions WHERE user_id = ? AND type = ? ORDER BY timestamp DESC',
      [userId, type]
    );

    return results.map(this.mapRowToTransaction);
  }

  /**
   * Calculate reward balance for a user
   */
  async getRewardBalance(userId: string): Promise<RewardBalance> {
    // Get total earned (earned + bonus)
    const earnedResult = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM reward_transactions
       WHERE user_id = ? AND type IN ('earned', 'bonus')`,
      [userId]
    );
    const totalEarned = earnedResult?.total || 0;

    // Get total spent
    const spentResult = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM reward_transactions
       WHERE user_id = ? AND type = 'spent'`,
      [userId]
    );
    const spent = spentResult?.total || 0;

    // Get pending allocations
    const allocationsResult = await this.db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(minutes), 0) as total FROM reward_allocations WHERE user_id = ?`,
      [userId]
    );
    const pendingAllocation = allocationsResult?.total || 0;

    const available = totalEarned - spent - pendingAllocation;

    return {
      totalEarned,
      available: Math.max(0, available),
      spent,
      pendingAllocation,
    };
  }

  /**
   * Create reward allocation
   */
  async createAllocation(userId: string, allocation: RewardAllocation): Promise<void> {
    const id = `${userId}_${allocation.appId}_${allocation.allocatedAt.getTime()}`;
    await this.db.runAsync(
      `INSERT INTO reward_allocations (id, user_id, app_id, minutes, allocated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, allocation.appId, allocation.minutes, allocation.allocatedAt.getTime()]
    );
  }

  /**
   * Get allocations for a user
   */
  async getAllocations(userId: string): Promise<RewardAllocation[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM reward_allocations WHERE user_id = ? ORDER BY allocated_at DESC',
      [userId]
    );

    return results.map(row => ({
      appId: row.app_id,
      minutes: row.minutes,
      allocatedAt: new Date(row.allocated_at),
    }));
  }

  /**
   * Delete allocation (when time is used)
   */
  async deleteAllocation(userId: string, appId: string): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM reward_allocations WHERE user_id = ? AND app_id = ?',
      [userId, appId]
    );
  }

  /**
   * Clear all allocations for a user
   */
  async clearAllocations(userId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM reward_allocations WHERE user_id = ?', [userId]);
  }

  /**
   * Create or update achievement
   */
  async createAchievement(achievement: Achievement): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO achievements (
        id, title, description, icon, requirement, type, category, reward_bonus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        achievement.id,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.requirement,
        achievement.type,
        achievement.category || null,
        achievement.rewardBonus || null,
      ]
    );
  }

  /**
   * Get all achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    const results = await this.db.getAllAsync<any>('SELECT * FROM achievements ORDER BY type, requirement ASC');

    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      requirement: row.requirement,
      type: row.type,
      category: row.category,
      unlocked: false, // Will be set based on user_achievements
      rewardBonus: row.reward_bonus,
    }));
  }

  /**
   * Get achievements with user unlock status
   */
  async getAchievementsForUser(userId: string): Promise<Achievement[]> {
    const results = await this.db.getAllAsync<any>(
      `SELECT a.*, ua.unlocked_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       ORDER BY a.type, a.requirement ASC`,
      [userId]
    );

    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      requirement: row.requirement,
      type: row.type,
      category: row.category,
      unlocked: !!row.unlocked_at,
      unlockedAt: row.unlocked_at ? new Date(row.unlocked_at) : undefined,
      rewardBonus: row.reward_bonus,
    }));
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)',
      [userId, achievementId, now]
    );
  }

  /**
   * Check if achievement is unlocked
   */
  async isAchievementUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [userId, achievementId]
    );

    return (result?.count || 0) > 0;
  }

  /**
   * Map database row to RewardTransaction object
   */
  private mapRowToTransaction(row: any): RewardTransaction {
    return {
      id: row.id,
      type: row.type,
      amount: row.amount,
      reason: row.reason,
      taskId: row.task_id,
      appId: row.app_id,
      timestamp: new Date(row.timestamp),
      description: row.description,
    };
  }
}
