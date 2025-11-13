import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import DatabaseService from '../database/DatabaseService';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';

// Storage keys
const STORAGE_KEYS = {
  USER: '@mindfultime:user',
  AUTH_TOKEN: '@mindfultime:auth_token',
  CURRENT_USER_ID: '@mindfultime:current_user_id',
};

class AuthService {
  /**
   * Login with email and password
   * @param credentials - Email and password
   * @returns User object if successful, null otherwise
   */
  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get user's password hash from database
      const passwordHash = await DatabaseService.users.getUserPasswordHash(credentials.email);
      if (!passwordHash) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await verifyPassword(credentials.password, passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Get user data
      const user = await DatabaseService.users.getUserByEmail(credentials.email);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate token
      const token = generateToken(user.id);

      // Store user, token, and user ID
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param credentials - Email, password, and name
   * @returns User object if successful
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if email already exists
      const existingUser = await DatabaseService.users.getUserByEmail(credentials.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password length
      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Hash password
      const passwordHash = await hashPassword(credentials.password);

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
        avatar: '👤',
      };

      // Save user to database
      await DatabaseService.users.createUser(newUser, passwordHash);

      // Generate token
      const token = generateToken(newUser.id);

      // Store user, token, and user ID
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user from storage
   * @returns User object if logged in, null otherwise
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (!userJson) {
        return null;
      }

      const user = JSON.parse(userJson);
      // Convert date string back to Date object
      user.createdAt = new Date(user.createdAt);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Verify if user is authenticated
   * @returns true if authenticated, false otherwise
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const user = await this.getCurrentUser();

      // In a real app, you would verify the token with your backend
      // For now, just check if both exist
      return !!(token && user);
    } catch (error) {
      console.error('Verify token error:', error);
      return false;
    }
  }

  /**
   * Initialize demo users in database
   * This should be called once on app initialization
   */
  async initializeDemoUsers(): Promise<void> {
    try {
      const demoUsers = [
        {
          id: '1',
          email: 'admin@mindfultime.com',
          name: 'Admin User',
          password: 'password123',
          avatar: '👨‍💼',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          email: 'user@example.com',
          name: 'John Doe',
          password: 'password123',
          avatar: '👤',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '3',
          email: 'maria@example.com',
          name: 'Maria Silva',
          password: 'password123',
          avatar: '👩',
          createdAt: new Date('2024-02-01'),
        },
        {
          id: '4',
          email: 'test@test.com',
          name: 'Test User',
          password: 'test123',
          avatar: '🧪',
          createdAt: new Date('2024-03-01'),
        },
      ];

      for (const demoUser of demoUsers) {
        // Check if user already exists
        const existingUser = await DatabaseService.users.getUserByEmail(demoUser.email);
        if (!existingUser) {
          const { password, ...userData } = demoUser;
          const passwordHash = await hashPassword(password);
          await DatabaseService.users.createUser(userData, passwordHash);
          console.log(`Demo user created: ${demoUser.email}`);
        }
      }
    } catch (error) {
      console.error('Error initializing demo users:', error);
    }
  }
}

// Export singleton instance
export default new AuthService();
