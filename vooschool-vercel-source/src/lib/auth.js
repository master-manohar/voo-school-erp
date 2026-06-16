'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Auth Context
 */
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state & methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('voo_auth_token');
      const storedUser = localStorage.getItem('voo_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      localStorage.removeItem('voo_auth_token');
      localStorage.removeItem('voo_user');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  /**
   * Login — store user and token
   */
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem('voo_auth_token', authToken);
    localStorage.setItem('voo_user', JSON.stringify(userData));
  }, []);

  /**
   * Logout — clear everything
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('voo_auth_token');
    localStorage.removeItem('voo_user');
  }, []);

  /**
   * Update user data in state and storage
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('voo_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  /**
   * Get user role
   */
  const role = user?.role || null;

  /**
   * Role check helpers
   */
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isParent = role === 'parent';
  const isStudent = role === 'student';

  /**
   * Check if user has one of the specified roles
   * @param  {...string} roles
   * @returns {boolean}
   */
  const hasRole = useCallback(
    (...roles) => {
      return roles.includes(role);
    },
    [role]
  );

  /**
   * Check if user can access admin features
   */
  const canManage = isAdmin;

  /**
   * Check if user can view class data
   */
  const canViewClassData = isAdmin || isTeacher;

  const value = {
    // State
    user,
    token,
    role,
    loading,
    initialized,
    isAuthenticated,

    // Role flags
    isAdmin,
    isTeacher,
    isParent,
    isStudent,

    // Methods
    login,
    logout,
    updateUser,
    hasRole,
    canManage,
    canViewClassData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @returns {object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication (for protected pages)
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.initialized && !auth.isAuthenticated) {
      // Auth context will handle showing login page via layout
    }
  }, [auth.initialized, auth.isAuthenticated]);

  return auth;
}

/**
 * Hook to require a specific role
 * @param  {...string} allowedRoles
 */
export function useRequireRole(...allowedRoles) {
  const auth = useRequireAuth();

  const hasAccess = auth.isAuthenticated && allowedRoles.includes(auth.role);

  return {
    ...auth,
    hasAccess,
  };
}

export default AuthContext;
