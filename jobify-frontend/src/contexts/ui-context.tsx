'use client';

import { STORAGE_KEYS, THEMES } from '@/lib/constants';
import { ErrorState, LoadingState, UIContextType } from '@/lib/types';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

// UI State
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: LoadingState;
  errors: ErrorState;
}

// UI Actions
type UIAction =
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: string; error: string | null } }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'CLEAR_ALL_LOADING' };

// Initial state
const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  loading: {},
  errors: {},
};

// UI reducer
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };

    case 'CLEAR_ALL_ERRORS':
      return { ...state, errors: {} };

    case 'CLEAR_ALL_LOADING':
      return { ...state, loading: {} };

    default:
      return state;
  }
}

// Create context
const UIContext = createContext<UIContextType | undefined>(undefined);

// UI provider component
interface UIProviderProps {
  children: React.ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Initialize UI state from localStorage
  useEffect(() => {
    const savedTheme = getLocalStorage(STORAGE_KEYS.THEME, THEMES.LIGHT);
    const savedSidebarState = getLocalStorage(STORAGE_KEYS.SIDEBAR_STATE, false);

    if (savedTheme !== state.theme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme as 'light' | 'dark' });
    }

    if (savedSidebarState !== state.sidebarOpen) {
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: savedSidebarState });
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save theme to localStorage
    setLocalStorage(STORAGE_KEYS.THEME, state.theme);
  }, [state.theme]);

  // Save sidebar state to localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.SIDEBAR_STATE, state.sidebarOpen);
  }, [state.sidebarOpen]);

  // Set sidebar open/close
  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  };

  // Set theme
  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  // Set loading state for a specific key
  const setLoading = (key: string, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, loading } });
  };

  // Set error for a specific key
  const setError = (key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, error } });
  };

  // Clear all errors
  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  // Clear all loading states
  const clearAllLoading = () => {
    dispatch({ type: 'CLEAR_ALL_LOADING' });
  };

  // Context value
  const value: UIContextType = {
    sidebarOpen: state.sidebarOpen,
    setSidebarOpen,
    theme: state.theme,
    setTheme,
    loading: state.loading,
    setLoading,
    errors: state.errors,
    setError,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// Custom hook to use UI context
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

// Additional hooks for specific UI states
export function useLoading(key?: string) {
  const { loading, setLoading } = useUI();

  if (key) {
    return {
      isLoading: loading[key] || false,
      setLoading: (value: boolean) => setLoading(key, value),
    };
  }

  return {
    loading,
    setLoading,
  };
}

export function useError(key?: string) {
  const { errors, setError } = useUI();

  if (key) {
    return {
      error: errors[key] || null,
      setError: (error: string | null) => setError(key, error),
    };
  }

  return {
    errors,
    setError,
  };
}

export function useTheme() {
  const { theme, setTheme } = useUI();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}

export function useSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  return {
    isOpen: sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
}

export default UIContext;