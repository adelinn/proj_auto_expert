import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeAndStoreToken, validateAndCleanToken } from '../utils/token';
import { AuthContext } from './authContext';

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
      const isValid = validateAndCleanToken();
      
      if (!isValid) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      // Decode and store token data
      const decoded = decodeAndStoreToken();
      
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
      const isValid = validateAndCleanToken();
      if (!isValid) {
        setUserData(null);
      } else {
        // Refresh decoded data
        const decoded = decodeAndStoreToken();
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
      const decoded = decodeAndStoreToken();
      setUserData(decoded);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

