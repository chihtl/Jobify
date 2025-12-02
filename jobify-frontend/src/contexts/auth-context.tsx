'use client';

import { authApi } from '@/lib/api';
import { STORAGE_KEYS, SUCCESS_MESSAGES } from '@/lib/constants';
import {
  Admin,
  AuthContextType,
  AuthResponse,
  Company,
  LoginCredentials,
  User,
  UserRole
} from '@/lib/types';
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@/lib/utils';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { toast } from 'sonner';

// Error type for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Auth State
interface AuthState {
  user: User | Company | Admin | null;
  userType: UserRole | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User | Company | Admin; userType: UserRole; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: User | Company | Admin };

// Initial state
const initialState: AuthState = {
  user: null,
  userType: null,
  token: null,
  isLoading: false,
  isInitialized: false,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        token: action.payload.token,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        userType: null,
        token: null,
        isLoading: false,
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const token = getLocalStorage(STORAGE_KEYS.TOKEN, null);
        const userData = getLocalStorage(STORAGE_KEYS.USER, null) as {
          user: User | Company | Admin;
          type: UserRole;
        } | null;

        if (token && userData && userData.user && userData.type) {
          // Option 1: Validate token với server (có thể fail)
          // Option 2: Chỉ khôi phục từ localStorage (không fail)

          // Chọn Option 2 để tránh mất data khi F5
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData.user,
              userType: userData.type,
              token,
            },
          });

          // Nếu muốn validate token, có thể uncomment đoạn này:
          /*
          try {
            await authApi.validateToken();
            // Token valid - đã khôi phục ở trên
          } catch (error) {
            console.warn('Token validation failed, but keeping localStorage data:', error);
            // Không xóa localStorage, chỉ log warning
          }
          */
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };

    initializeAuth();
  }, []);

  // Login function - sử dụng unified login
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authApi.login(credentials.email, credentials.password);
      const authData: AuthResponse = response.data;
      const { accessToken, user: authUser } = authData;

      if (!authUser) {
        throw new Error('Invalid response data: user information missing');
      }

      // Lấy user type từ response của server
      const userType = authUser.type as UserRole;

      // Convert auth response user to proper user object
      const user: User | Company | Admin = {
        _id: authUser.id,
        name: authUser.name || '',
        email: authUser.email,
        logoUrl: authUser.logoUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(authUser.role && { role: authUser.role })
      } as User | Company | Admin;

      // Store in localStorage
      setLocalStorage(STORAGE_KEYS.TOKEN, accessToken);
      setLocalStorage(STORAGE_KEYS.USER, { user, type: userType });

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, userType, token: accessToken },
      });

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as ApiError).response?.data?.message || 'Đăng nhập thất bại'
        : 'Đăng nhập thất bại';
      toast.error(message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      removeLocalStorage(STORAGE_KEYS.TOKEN);
      removeLocalStorage(STORAGE_KEYS.USER);

      // Update state
      dispatch({ type: 'LOGOUT' });

      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update profile function
  const updateProfile = async (data: User | Company | Admin) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Update profile via API based on user type
      if (state.userType === UserRole.USER) {
        // Update user profile API call
        await authApi.validateToken(); // Placeholder - implement actual user update API
      } else if (state.userType === UserRole.COMPANY) {
        // Update company profile API call
        await authApi.validateToken(); // Placeholder - implement actual company update API
      } else if (state.userType === UserRole.ADMIN) {
        // Update admin profile API call
        await authApi.validateToken(); // Placeholder - implement actual admin update API
      }

      // Update user data in localStorage
      const userData = getLocalStorage(STORAGE_KEYS.USER, null) as {
        user: User | Company | Admin;
        type: UserRole;
      } | null;
      if (userData && userData.user) {
        const updatedUserData = { ...userData, user: { ...userData.user, ...data } };
        setLocalStorage(STORAGE_KEYS.USER, updatedUserData);
      }

      // Update state
      if (state.user) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: { ...state.user, ...data },
        });
      }

      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as ApiError).response?.data?.message || 'Cập nhật hồ sơ thất bại'
        : 'Cập nhật hồ sơ thất bại';
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Context value
  const value: AuthContextType = {
    user: state.user,
    userType: state.userType,
    token: state.token,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!state.token && !!state.user,
  };

  // Don't render children until auth is initialized
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;