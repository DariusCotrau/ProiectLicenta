import { MindfulTask, CompletedTask, TaskCategory } from '../types';
import { PREDEFINED_TASKS } from '../constants/tasks';
import StorageService from './StorageService';
import TimeLimitService from './TimeLimitService';

class TaskService {
  /**
   * Get all available tasks (predefined + custom)
   */
  async getAllTasks(): Promise<MindfulTask[]> {
    // For now, return predefined tasks
    // Later, we can add custom tasks from storage
    return PREDEFINED_TASKS;
  }

  /**
   * Get tasks by category
   */
  async getTasksByCategory(category: TaskCategory): Promise<MindfulTask[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.category === category);
  }

  /**
   * Complete a task and earn time
   */
  async completeTask(
    task: MindfulTask,
    photoUri?: string,
    notes?: string
  ): Promise<CompletedTask> {
    // Create completed task record
    const completedTask: CompletedTask = {
      id: `${task.id}-${Date.now()}`,
      taskId: task.id,
      completedAt: new Date(),
      photoUri,
      timeEarned: task.timeReward,
      notes,
    };

    // Save to storage
    await StorageService.addCompletedTask(completedTask);

    // Update user stats
    const stats = await StorageService.getUserStats();
    await StorageService.updateUserStats({
      totalTasksCompleted: stats.totalTasksCompleted + 1,
      totalTimeEarned: stats.totalTimeEarned + task.timeReward,
      tasksCompletedToday: stats.tasksCompletedToday + 1,
    });

    // Distribute earned time to apps
    await TimeLimitService.distributeEarnedTime(task.timeReward);

    // Update streak
    await this.updateStreak();

    return completedTask;
  }

  /**
   * Update user's task completion streak
   */
  private async updateStreak(): Promise<void> {
    const stats = await StorageService.getUserStats();
    const tasks = await StorageService.getCompletedTasks();

    if (tasks.length === 0) return;

    // Check if user completed tasks yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const hasTasksYesterday = tasks.some(
      task => new Date(task.completedAt).toDateString() === yesterdayStr
    );

    const hasTasksToday = tasks.some(
      task => new Date(task.completedAt).toDateString() === new Date().toDateString()
    );

    let newStreak = stats.currentStreak;

    if (hasTasksToday) {
      if (hasTasksYesterday || stats.currentStreak === 0) {
        newStreak = stats.currentStreak + 1;
      }
    } else if (!hasTasksYesterday) {
      newStreak = 0;
    }

    const longestStreak = Math.max(stats.longestStreak, newStreak);

    await StorageService.updateUserStats({
      currentStreak: newStreak,
      longestStreak,
    });
  }

  /**
   * Get tasks completed today
   */
  async getTasksCompletedToday(): Promise<CompletedTask[]> {
    return await StorageService.getTasksCompletedToday();
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<MindfulTask | undefined> {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === taskId);
  }

  /**
   * Check if task can be completed (validation)
   */
  canCompleteTask(task: MindfulTask, hasPhoto: boolean): { valid: boolean; reason?: string } {
    if (task.requiresPhoto && !hasPhoto) {
      return { valid: false, reason: 'Această activitate necesită o fotografie' };
    }
    return { valid: true };
  }

  /**
   * Get recommended tasks based on time of day or user history
   */
  async getRecommendedTasks(): Promise<MindfulTask[]> {
    const hour = new Date().getHours();
    const tasks = await this.getAllTasks();

    // Morning tasks (6-12)
    if (hour >= 6 && hour < 12) {
      return tasks.filter(t =>
        [TaskCategory.OUTDOOR, TaskCategory.EXERCISE, TaskCategory.MEDITATION].includes(t.category)
      );
    }

    // Afternoon tasks (12-18)
    if (hour >= 12 && hour < 18) {
      return tasks.filter(t =>
        [TaskCategory.READING, TaskCategory.CREATIVE, TaskCategory.SOCIAL].includes(t.category)
      );
    }

    // Evening tasks (18-22)
    if (hour >= 18 && hour < 22) {
      return tasks.filter(t =>
        [TaskCategory.READING, TaskCategory.MEDITATION, TaskCategory.CREATIVE].includes(t.category)
      );
    }

    // Default: return all tasks
    return tasks;
  }
}

export default new TaskService();
