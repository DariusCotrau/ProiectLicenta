import * as SQLite from 'expo-sqlite';
import { App } from '../../types';

/**
 * Repository for app-related database operations
 */
export class AppRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  /**
   * Create a new app
   */
  async createApp(userId: string, app: App): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO apps (
        id, user_id, name, package_name, icon, daily_limit,
        used_time, is_blocked, category, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        app.id,
        userId,
        app.name,
        app.packageName,
        app.icon || null,
        app.dailyLimit,
        app.usedTime,
        app.isBlocked ? 1 : 0,
        app.category || null,
        now,
        now,
      ]
    );
  }

  /**
   * Get all apps for a user
   */
  async getApps(userId: string): Promise<App[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM apps WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );

    return results.map(this.mapRowToApp);
  }

  /**
   * Get app by ID
   */
  async getAppById(appId: string): Promise<App | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM apps WHERE id = ?',
      [appId]
    );

    return result ? this.mapRowToApp(result) : null;
  }

  /**
   * Get app by package name
   */
  async getAppByPackageName(userId: string, packageName: string): Promise<App | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM apps WHERE user_id = ? AND package_name = ?',
      [userId, packageName]
    );

    return result ? this.mapRowToApp(result) : null;
  }

  /**
   * Update app
   */
  async updateApp(appId: string, updates: Partial<App>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.dailyLimit !== undefined) {
      fields.push('daily_limit = ?');
      values.push(updates.dailyLimit);
    }
    if (updates.usedTime !== undefined) {
      fields.push('used_time = ?');
      values.push(updates.usedTime);
    }
    if (updates.isBlocked !== undefined) {
      fields.push('is_blocked = ?');
      values.push(updates.isBlocked ? 1 : 0);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(appId);

    await this.db.runAsync(
      `UPDATE apps SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Update app used time
   */
  async updateAppUsedTime(appId: string, usedTime: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE apps SET used_time = ?, updated_at = ? WHERE id = ?',
      [usedTime, Date.now(), appId]
    );
  }

  /**
   * Increment app used time
   */
  async incrementAppUsedTime(appId: string, minutes: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE apps SET used_time = used_time + ?, updated_at = ? WHERE id = ?',
      [minutes, Date.now(), appId]
    );
  }

  /**
   * Reset daily usage for all apps
   */
  async resetDailyUsage(userId: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE apps SET used_time = 0, updated_at = ? WHERE user_id = ?',
      [Date.now(), userId]
    );
  }

  /**
   * Delete app
   */
  async deleteApp(appId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM apps WHERE id = ?', [appId]);
  }

  /**
   * Get blocked apps
   */
  async getBlockedApps(userId: string): Promise<App[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM apps WHERE user_id = ? AND is_blocked = 1',
      [userId]
    );

    return results.map(this.mapRowToApp);
  }

  /**
   * Bulk update apps
   */
  async bulkUpdateApps(userId: string, apps: App[]): Promise<void> {
    // Delete all existing apps for user
    await this.db.runAsync('DELETE FROM apps WHERE user_id = ?', [userId]);

    // Insert new apps
    for (const app of apps) {
      await this.createApp(userId, app);
    }
  }

  /**
   * Map database row to App object
   */
  private mapRowToApp(row: any): App {
    return {
      id: row.id,
      name: row.name,
      packageName: row.package_name,
      icon: row.icon,
      dailyLimit: row.daily_limit,
      usedTime: row.used_time,
      isBlocked: row.is_blocked === 1,
      category: row.category,
    };
  }
}
