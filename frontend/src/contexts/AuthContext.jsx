import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeAndStoreToken, validateAndCleanToken } from '../utils/token';

const AuthContext = createContext(null);

/**
 * AuthContext Provider component
 * Manages authentication state and provides token data to child components
 */
export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      
      // Validate token first
      const isValid = validateAndCleanToken(navigate);
      
      if (!isValid) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      // Decode and store token data
      const decoded = decodeAndStoreToken(navigate);
      
      if (decoded) {
        setUserData(decoded);
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Listen for storage changes (e.g., token removed in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Re-validate token periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const isValid = validateAndCleanToken(navigate);
      if (!isValid) {
        setUserData(null);
      } else {
        // Refresh decoded data
        const decoded = decodeAndStoreToken(navigate);
        if (decoded) {
          setUserData(decoded);
        } else {
          setUserData(null);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [navigate]);

  const value = {
    userData,
    isLoading,
    // Helper to check if user is authenticated
    isAuthenticated: !!userData,
    // Helper to refresh token data
    refreshAuth: () => {
      const decoded = decodeAndStoreToken(navigate);
      setUserData(decoded);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

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

