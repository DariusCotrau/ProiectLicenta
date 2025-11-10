import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterCredentials } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USER: '@mindfultime:user',
  AUTH_TOKEN: '@mindfultime:auth_token',
};

// Hardcoded users for demonstration
// Password: "password123" for all users
const HARDCODED_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@mindfultime.com',
    name: 'Admin User',
    password: 'password123',
    createdAt: new Date('2024-01-01'),
    avatar: '👨‍💼',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'John Doe',
    password: 'password123',
    createdAt: new Date('2024-01-15'),
    avatar: '👤',
  },
  {
    id: '3',
    email: 'maria@example.com',
    name: 'Maria Silva',
    password: 'password123',
    createdAt: new Date('2024-02-01'),
    avatar: '👩',
  },
  {
    id: '4',
    email: 'test@test.com',
    name: 'Test User',
    password: 'test123',
    createdAt: new Date('2024-03-01'),
    avatar: '🧪',
  },
];

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

      // Find user in hardcoded users
      const foundUser = HARDCODED_USERS.find(
        user =>
          user.email.toLowerCase() === credentials.email.toLowerCase() &&
          user.password === credentials.password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = foundUser;

      // Generate a simple token (in real app, this would come from backend)
      const token = `token_${foundUser.id}_${Date.now()}`;

      // Store user and token
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      return userWithoutPassword;
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
      const existingUser = HARDCODED_USERS.find(
        user => user.email.toLowerCase() === credentials.email.toLowerCase()
      );

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

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
        avatar: '👤',
      };

      // In a real app, this would be saved to a database
      // For now, we'll just add it to our hardcoded array
      HARDCODED_USERS.push({ ...newUser, password: credentials.password });

      // Generate token
      const token = `token_${newUser.id}_${Date.now()}`;

      // Store user and token
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

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
   * Get all hardcoded users (for debugging/testing)
   * Returns users without passwords
   */
  getHardcodedUsers(): Omit<User, 'password'>[] {
    return HARDCODED_USERS.map(({ password, ...user }) => user);
  }
}

// Export singleton instance
export default new AuthService();
