import * as SQLite from 'expo-sqlite';
import { MindfulTask, CompletedTask, DailyUsage } from '../../types';

/**
 * Repository for task-related database operations
 */
export class TaskRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  /**
   * Create a new task
   */
  async createTask(task: MindfulTask, userId?: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO tasks (
        id, title, description, category, time_reward, icon,
        requires_photo, is_custom, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description,
        task.category,
        task.timeReward,
        task.icon,
        task.requiresPhoto ? 1 : 0,
        task.isCustom ? 1 : 0,
        userId || null,
        now,
        now,
      ]
    );
  }

  /**
   * Get all tasks (default + user custom tasks)
   */
  async getTasks(userId?: string): Promise<MindfulTask[]> {
    let query = 'SELECT * FROM tasks WHERE user_id IS NULL';
    const params: any[] = [];

    if (userId) {
      query += ' OR user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY category, title ASC';

    const results = await this.db.getAllAsync<any>(query, params);
    return results.map(this.mapRowToTask);
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<MindfulTask | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    return result ? this.mapRowToTask(result) : null;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, updates: Partial<MindfulTask>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.timeReward !== undefined) {
      fields.push('time_reward = ?');
      values.push(updates.timeReward);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }
    if (updates.requiresPhoto !== undefined) {
      fields.push('requires_photo = ?');
      values.push(updates.requiresPhoto ? 1 : 0);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(taskId);

    await this.db.runAsync(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM tasks WHERE id = ?', [taskId]);
  }

  /**
   * Complete a task
   */
  async completeTask(userId: string, completedTask: CompletedTask): Promise<void> {
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO completed_tasks (
        id, task_id, user_id, completed_at, photo_uri, time_earned, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        completedTask.id,
        completedTask.taskId,
        userId,
        completedTask.completedAt.getTime(),
        completedTask.photoUri || null,
        completedTask.timeEarned,
        completedTask.notes || null,
        now,
      ]
    );
  }

  /**
   * Get all completed tasks for a user
   */
  async getCompletedTasks(userId: string): Promise<CompletedTask[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM completed_tasks WHERE user_id = ? ORDER BY completed_at DESC',
      [userId]
    );

    return results.map(this.mapRowToCompletedTask);
  }

  /**
   * Get completed tasks for a specific date
   */
  async getCompletedTasksByDate(userId: string, date: Date): Promise<CompletedTask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await this.db.getAllAsync<any>(
      `SELECT * FROM completed_tasks
       WHERE user_id = ? AND completed_at >= ? AND completed_at <= ?
       ORDER BY completed_at DESC`,
      [userId, startOfDay.getTime(), endOfDay.getTime()]
    );

    return results.map(this.mapRowToCompletedTask);
  }

  /**
   * Get completed tasks for today
   */
  async getCompletedTasksToday(userId: string): Promise<CompletedTask[]> {
    return this.getCompletedTasksByDate(userId, new Date());
  }

  /**
   * Get task completion count for a date range
   */
  async getTaskCompletionCount(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM completed_tasks
       WHERE user_id = ? AND completed_at >= ? AND completed_at <= ?`,
      [userId, startDate.getTime(), endDate.getTime()]
    );

    return result?.count || 0;
  }

  /**
   * Save daily usage data
   */
  async saveDailyUsage(userId: string, usage: DailyUsage): Promise<void> {
    const now = Date.now();
    const appUsageJson = JSON.stringify(usage.appUsage);

    // Try to update first
    const result = await this.db.runAsync(
      `UPDATE daily_usage
       SET app_usage = ?, tasks_completed = ?, time_earned = ?
       WHERE user_id = ? AND date = ?`,
      [appUsageJson, usage.tasksCompleted, usage.timeEarned, userId, usage.date]
    );

    // If no rows were updated, insert new record
    if (result.changes === 0) {
      const id = `${userId}_${usage.date}`;
      await this.db.runAsync(
        `INSERT INTO daily_usage (id, user_id, date, app_usage, tasks_completed, time_earned, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, usage.date, appUsageJson, usage.tasksCompleted, usage.timeEarned, now]
      );
    }
  }

  /**
   * Get daily usage data
   */
  async getDailyUsage(userId: string, date: string): Promise<DailyUsage | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM daily_usage WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (!result) {
      return null;
    }

    return {
      date: result.date,
      appUsage: JSON.parse(result.app_usage),
      tasksCompleted: result.tasks_completed,
      timeEarned: result.time_earned,
    };
  }

  /**
   * Get daily usage for a date range
   */
  async getDailyUsageRange(userId: string, startDate: string, endDate: string): Promise<DailyUsage[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM daily_usage WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      [userId, startDate, endDate]
    );

    return results.map(row => ({
      date: row.date,
      appUsage: JSON.parse(row.app_usage),
      tasksCompleted: row.tasks_completed,
      timeEarned: row.time_earned,
    }));
  }

  /**
   * Map database row to MindfulTask object
   */
  private mapRowToTask(row: any): MindfulTask {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      timeReward: row.time_reward,
      icon: row.icon,
      requiresPhoto: row.requires_photo === 1,
      isCustom: row.is_custom === 1,
    };
  }

  /**
   * Map database row to CompletedTask object
   */
  private mapRowToCompletedTask(row: any): CompletedTask {
    return {
      id: row.id,
      taskId: row.task_id,
      completedAt: new Date(row.completed_at),
      photoUri: row.photo_uri,
      timeEarned: row.time_earned,
      notes: row.notes,
    };
  }
}
