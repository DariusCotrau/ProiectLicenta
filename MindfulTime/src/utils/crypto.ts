/**
 * Simple password hashing utilities
 * In a production app, you should use a proper crypto library like bcrypt or argon2
 */

/**
 * Hash a password using a simple algorithm
 * NOTE: This is a simplified implementation for demonstration
 * In production, use a proper library like bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  // Simple hash implementation (not cryptographically secure)
  // In a real app, use expo-crypto or a similar library
  let hash = 0;
  const str = password + 'MindfulTimeSalt2024'; // Add salt

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

/**
 * Generate a random token
 */
export function generateToken(userId: string): string {
  return `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
