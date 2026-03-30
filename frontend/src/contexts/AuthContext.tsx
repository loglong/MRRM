import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { message } from 'antd';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  orgId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
  autoRefreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mrrm_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mrrm_token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password, rememberMe });
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('mrrm_user', JSON.stringify(data.user));
      localStorage.setItem('mrrm_token', data.accessToken);
      message.success('Login successful');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Login failed. Please check your credentials.';
      message.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, phone?: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.register({ email, password, name, phone });
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('mrrm_user', JSON.stringify(data.user));
      localStorage.setItem('mrrm_token', data.accessToken);
      message.success('Registration successful');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Registration failed. Please try again.';
      message.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('mrrm_user');
    localStorage.removeItem('mrrm_token');
    message.success('Logged out successfully');
  }, []);

  const autoRefreshToken = useCallback(async () => {
    try {
      const result = await authApi.refreshToken();
      if (result.accessToken) {
        setToken(result.accessToken);
        localStorage.setItem('mrrm_token', result.accessToken);
      }
    } catch {
      // Silent fail for auto-refresh
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    if (token) {
      // Try to refresh token if we have one
      autoRefreshToken();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        autoRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
