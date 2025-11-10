import { useContext } from 'react';
import AuthContext from './AuthContext';

/**
 * Custom hook to use authentication context
 * @throws Error if used outside of AuthProvider
 * @returns Authentication context with user, state, and auth methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
