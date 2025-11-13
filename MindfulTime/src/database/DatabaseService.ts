import Database from './Database';
import { UserRepository } from './repositories/UserRepository';
import { AppRepository } from './repositories/AppRepository';
import { TaskRepository } from './repositories/TaskRepository';
import { RewardRepository } from './repositories/RewardRepository';

/**
 * Main database service that provides access to all repositories
 * This is the main entry point for all database operations
 */
class DatabaseService {
  private initialized = false;
  private userRepository?: UserRepository;
  private appRepository?: AppRepository;
  private taskRepository?: TaskRepository;
  private rewardRepository?: RewardRepository;

  /**
   * Initialize the database and all repositories
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Database already initialized');
      return;
    }

    try {
      await Database.init();
      const db = Database.getDatabase();

      // Initialize all repositories
      this.userRepository = new UserRepository(db);
      this.appRepository = new AppRepository(db);
      this.taskRepository = new TaskRepository(db);
      this.rewardRepository = new RewardRepository(db);

      this.initialized = true;
      console.log('DatabaseService initialized successfully');
    } catch (error) {
      console.error('Error initializing DatabaseService:', error);
      throw error;
    }
  }

  /**
   * Get UserRepository instance
   */
  get users(): UserRepository {
    if (!this.userRepository) {
      throw new Error('DatabaseService not initialized. Call initialize() first.');
    }
    return this.userRepository;
  }

  /**
   * Get AppRepository instance
   */
  get apps(): AppRepository {
    if (!this.appRepository) {
      throw new Error('DatabaseService not initialized. Call initialize() first.');
    }
    return this.appRepository;
  }

  /**
   * Get TaskRepository instance
   */
  get tasks(): TaskRepository {
    if (!this.taskRepository) {
      throw new Error('DatabaseService not initialized. Call initialize() first.');
    }
    return this.taskRepository;
  }

  /**
   * Get RewardRepository instance
   */
  get rewards(): RewardRepository {
    if (!this.rewardRepository) {
      throw new Error('DatabaseService not initialized. Call initialize() first.');
    }
    return this.rewardRepository;
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await Database.close();
    this.initialized = false;
    this.userRepository = undefined;
    this.appRepository = undefined;
    this.taskRepository = undefined;
    this.rewardRepository = undefined;
  }

  /**
   * Reset database (use with caution - for testing only)
   */
  async reset(): Promise<void> {
    await Database.reset();
    console.log('Database reset complete');
  }
}

// Export singleton instance
export default new DatabaseService();
