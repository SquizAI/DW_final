import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api';
import { notifications } from '@mantine/notifications';
import { jwtDecode } from 'jwt-decode';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  organization?: {
    id: string;
    name: string;
  };
  preferences?: {
    theme: 'light' | 'dark';
    dashboardLayout: string;
    notifications: boolean;
  };
  // Additional profile fields
  bio?: string;
  jobTitle?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// Define JWT token interface
interface JwtToken {
  sub: string; // user id
  name: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setCurrentOrganization: (orgId: string) => void;
  refreshToken: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  setCurrentOrganization: () => {},
  refreshToken: async () => {},
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Flag to use mock authentication (set to false to use real backend)
const USE_MOCK_AUTH = false;

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to get token expiration time
  const getTokenExpiration = (token: string): number => {
    try {
      const decoded = jwtDecode<JwtToken>(token);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return 0;
    }
  };
  
  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    const expiration = getTokenExpiration(token);
    return expiration <= Date.now();
  };
  
  // Function to get user from token
  const getUserFromToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<JwtToken>(token);
      
      // Create user object from token data
      return {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role as 'user' | 'admin',
        // Other fields will be populated from the user endpoint
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };
  
  // Function to set auth tokens
  const setAuthTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Set authorization header for API requests
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };
  
  // Function to clear auth tokens
  const clearAuthTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
  };
  
  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      
      if (response.status === 200 && response.data.access_token) {
        setAuthTokens(response.data.access_token, response.data.refresh_token || refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };
  
  // Function to fetch user data
  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.status === 200) {
        const userData = response.data;
        
        // Save user data to local storage
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check for access token
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        
        if (!accessToken) {
          setIsLoading(false);
          return;
        }
        
        // Check if token is expired
        if (isTokenExpired(accessToken)) {
          // Try to refresh token
          const refreshed = await refreshToken();
          
          if (!refreshed) {
            clearAuthTokens();
            setUser(null);
            setIsLoading(false);
            return;
          }
        } else {
          // Set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // Try to get user from local storage first
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Fetch fresh user data
        const userData = await fetchUserData();
        
        if (userData) {
          setUser(userData);
        } else {
          clearAuthTokens();
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        clearAuthTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    
    // Set up token refresh interval
    const tokenRefreshInterval = setInterval(async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      
      if (accessToken && isTokenExpired(accessToken)) {
        await refreshToken();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.status === 200 && response.data.access_token) {
        // Set tokens
        setAuthTokens(response.data.access_token, response.data.refresh_token);
        
        // Get user from token
        const userData = getUserFromToken(response.data.access_token);
        
        if (userData) {
          // Fetch complete user data
          const fullUserData = await fetchUserData();
          
          if (fullUserData) {
            setUser(fullUserData);
            
            notifications.show({
              title: 'Welcome back!',
              message: `You've successfully logged in as ${fullUserData.name}`,
              color: 'green',
            });
          }
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login';
      
      notifications.show({
        title: 'Login failed',
        message: errorMessage,
        color: 'red',
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.status === 201 && response.data.access_token) {
        // Set tokens
        setAuthTokens(response.data.access_token, response.data.refresh_token);
        
        // Get user from token
        const userData = getUserFromToken(response.data.access_token);
        
        if (userData) {
          // Fetch complete user data
          const fullUserData = await fetchUserData();
          
          if (fullUserData) {
            setUser(fullUserData);
            
            notifications.show({
              title: 'Registration successful',
              message: 'Your account has been created',
              color: 'green',
            });
          }
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during registration';
      
      notifications.show({
        title: 'Registration failed',
        message: errorMessage,
        color: 'red',
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and user data
      clearAuthTokens();
      setUser(null);
      
      notifications.show({
        title: 'Logged out',
        message: 'You have been successfully logged out',
        color: 'blue',
      });
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.status === 200) {
        // Update user state
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser as User);
        
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        
        notifications.show({
          title: 'Profile updated',
          message: 'Your profile has been successfully updated',
          color: 'green',
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while updating profile';
      
      notifications.show({
        title: 'Update failed',
        message: errorMessage,
        color: 'red',
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Set current organization
  const setCurrentOrganization = async (orgId: string) => {
    if (!user) return;
    
    try {
      const response = await api.post('/auth/organization', { organization_id: orgId });
      
      if (response.status === 200) {
        // Update user state with new organization
        const updatedUser = { 
          ...user, 
          organization: { 
            id: orgId, 
            name: response.data.organization_name 
          } 
        };
        
        setUser(updatedUser);
        
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        
        notifications.show({
          title: 'Organization changed',
          message: `You are now working in ${response.data.organization_name}`,
          color: 'green',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change organization';
      
      notifications.show({
        title: 'Organization change failed',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        setCurrentOrganization,
        refreshToken: async () => {
          const success = await refreshToken();
          return success ? Promise.resolve() : Promise.reject();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext); 