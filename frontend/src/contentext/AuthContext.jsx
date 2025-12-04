import { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage, isAuthenticated, isAdmin } from '../utils/security';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userData = tokenStorage.getUser();
          if (userData) {
            setUser(userData);
            setLoading(false);
            return;
          }
          
          // Try to fetch fresh user data (but don't fail if backend is down)
          try {
            const response = await authAPI.getProfile();
            if (response && response.success) {
              setUser(response.data.user);
              tokenStorage.setUser(response.data.user);
            }
          } catch (apiError) {
            // Backend might be down or token invalid - just use stored data or continue
            console.warn('Could not fetch user profile:', apiError);
            tokenStorage.remove();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        tokenStorage.remove();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      if (response.success) {
        tokenStorage.set(response.data.token);
        tokenStorage.setUser(response.data.user);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register({ username, email, password });
      if (response.success) {
        tokenStorage.set(response.data.token);
        tokenStorage.setUser(response.data.user);
        setUser(response.data.user);
        toast.success('Registration successful!');
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
    tokenStorage.setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

