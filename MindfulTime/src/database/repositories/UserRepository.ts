import * as SQLite from 'expo-sqlite';
import { User, UserStats, AppSettings } from '../../types';

/**
 * Repository for user-related database operations
 */
export class UserRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  /**
   * Create a new user
   */
  async createUser(user: User, passwordHash: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO users (id, email, name, password_hash, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.name, passwordHash, user.avatar || null, now, now]
    );

    // Initialize user stats
    await this.initializeUserStats(user.id);

    // Initialize user settings
    await this.initializeUserSettings(user.id);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      avatar: result.avatar,
      createdAt: new Date(result.created_at),
    };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT id, email, name, avatar, created_at FROM users WHERE email = ?',
      [email]
    );

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      avatar: result.avatar,
      createdAt: new Date(result.created_at),
    };
  }

  /**
   * Get user password hash for authentication
   */
  async getUserPasswordHash(email: string): Promise<string | null> {
    const result = await this.db.getFirstAsync<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE email = ?',
      [email]
    );

    return result?.password_hash || null;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(userId);

    await this.db.runAsync(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
  }

  /**
   * Initialize user stats
   */
  private async initializeUserStats(userId: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO user_stats (
        user_id, total_tasks_completed, total_time_earned, total_time_saved,
        current_streak, longest_streak, tasks_completed_today, updated_at
      ) VALUES (?, 0, 0, 0, 0, 0, 0, ?)`,
      [userId, now]
    );
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );

    if (!result) {
      // Return default stats if not found
      return {
        totalTasksCompleted: 0,
        totalTimeEarned: 0,
        totalTimeSaved: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompletedToday: 0,
      };
    }

    return {
      totalTasksCompleted: result.total_tasks_completed,
      totalTimeEarned: result.total_time_earned,
      totalTimeSaved: result.total_time_saved,
      currentStreak: result.current_streak,
      longestStreak: result.longest_streak,
      tasksCompletedToday: result.tasks_completed_today,
    };
  }

  /**
   * Update user stats
   */
  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (stats.totalTasksCompleted !== undefined) {
      fields.push('total_tasks_completed = ?');
      values.push(stats.totalTasksCompleted);
    }
    if (stats.totalTimeEarned !== undefined) {
      fields.push('total_time_earned = ?');
      values.push(stats.totalTimeEarned);
    }
    if (stats.totalTimeSaved !== undefined) {
      fields.push('total_time_saved = ?');
      values.push(stats.totalTimeSaved);
    }
    if (stats.currentStreak !== undefined) {
      fields.push('current_streak = ?');
      values.push(stats.currentStreak);
    }
    if (stats.longestStreak !== undefined) {
      fields.push('longest_streak = ?');
      values.push(stats.longestStreak);
    }
    if (stats.tasksCompletedToday !== undefined) {
      fields.push('tasks_completed_today = ?');
      values.push(stats.tasksCompletedToday);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(userId);

    await this.db.runAsync(
      `UPDATE user_stats SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
  }

  /**
   * Initialize user settings
   */
  private async initializeUserSettings(userId: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO settings (
        user_id, notifications_enabled, strict_mode, daily_goal, theme, updated_at
      ) VALUES (?, 1, 0, 60, 'auto', ?)`,
      [userId, now]
    );
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<AppSettings> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM settings WHERE user_id = ?',
      [userId]
    );

    if (!result) {
      // Return default settings if not found
      return {
        notificationsEnabled: true,
        strictMode: false,
        dailyGoal: 60,
        theme: 'auto',
      };
    }

    return {
      notificationsEnabled: result.notifications_enabled === 1,
      strictMode: result.strict_mode === 1,
      dailyGoal: result.daily_goal,
      theme: result.theme,
    };
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: Partial<AppSettings>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (settings.notificationsEnabled !== undefined) {
      fields.push('notifications_enabled = ?');
      values.push(settings.notificationsEnabled ? 1 : 0);
    }
    if (settings.strictMode !== undefined) {
      fields.push('strict_mode = ?');
      values.push(settings.strictMode ? 1 : 0);
    }
    if (settings.dailyGoal !== undefined) {
      fields.push('daily_goal = ?');
      values.push(settings.dailyGoal);
    }
    if (settings.theme !== undefined) {
      fields.push('theme = ?');
      values.push(settings.theme);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(userId);

    await this.db.runAsync(
      `UPDATE settings SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
  }
}
