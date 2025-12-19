import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';

/**
 * Hook to access auth context
 * @returns {object} - Auth context value with userData, isLoading, isAuthenticated, refreshAuth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

