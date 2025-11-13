import * as SQLite from 'expo-sqlite';

/**
 * Database connection and initialization
 * This module provides the SQLite database connection and schema creation
 */

const DB_NAME = 'mindfultime.db';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize database connection and create tables
   */
  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * Create all database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Apps table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS apps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        package_name TEXT NOT NULL,
        icon TEXT,
        daily_limit INTEGER NOT NULL DEFAULT 0,
        used_time INTEGER NOT NULL DEFAULT 0,
        is_blocked INTEGER NOT NULL DEFAULT 0,
        category TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create index on package_name for faster lookups
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_apps_package_name ON apps(package_name);
    `);

    // Tasks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        time_reward INTEGER NOT NULL,
        icon TEXT NOT NULL,
        requires_photo INTEGER NOT NULL DEFAULT 0,
        is_custom INTEGER NOT NULL DEFAULT 0,
        user_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Completed tasks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS completed_tasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        completed_at INTEGER NOT NULL,
        photo_uri TEXT,
        time_earned INTEGER NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create index on completed_at for faster date queries
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_completed_tasks_date ON completed_tasks(completed_at);
    `);

    // User stats table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id TEXT PRIMARY KEY,
        total_tasks_completed INTEGER NOT NULL DEFAULT 0,
        total_time_earned INTEGER NOT NULL DEFAULT 0,
        total_time_saved INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        tasks_completed_today INTEGER NOT NULL DEFAULT 0,
        last_activity_date TEXT,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT PRIMARY KEY,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        strict_mode INTEGER NOT NULL DEFAULT 0,
        daily_goal INTEGER NOT NULL DEFAULT 60,
        theme TEXT NOT NULL DEFAULT 'auto',
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Daily usage table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_usage (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        app_usage TEXT NOT NULL,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        time_earned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create unique index on user_id and date
    await this.db.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);
    `);

    // Reward transactions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS reward_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        task_id TEXT,
        app_id TEXT,
        timestamp INTEGER NOT NULL,
        description TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL,
        FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE SET NULL
      );
    `);

    // Create index on timestamp for transaction history queries
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON reward_transactions(timestamp DESC);
    `);

    // Achievements table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        requirement INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        reward_bonus INTEGER
      );
    `);

    // User achievements table (tracks which achievements users have unlocked)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE
      );
    `);

    // Reward allocations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS reward_allocations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        app_id TEXT NOT NULL,
        minutes INTEGER NOT NULL,
        allocated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE
      );
    `);

    console.log('All database tables created successfully');
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  /**
   * Drop all tables (use with caution - for testing only)
   */
  async dropAllTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tables = [
      'reward_allocations',
      'user_achievements',
      'achievements',
      'reward_transactions',
      'daily_usage',
      'settings',
      'user_stats',
      'completed_tasks',
      'tasks',
      'apps',
      'users',
    ];

    for (const table of tables) {
      await this.db.execAsync(`DROP TABLE IF EXISTS ${table};`);
    }

    console.log('All tables dropped');
  }

  /**
   * Reset database (drop and recreate all tables)
   */
  async reset(): Promise<void> {
    await this.dropAllTables();
    await this.createTables();
    console.log('Database reset complete');
  }
}

// Export singleton instance
export default new Database();
