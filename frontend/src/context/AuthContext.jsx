import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const defaultUser = {
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-authenticate as Admin on start
    localStorage.setItem('lms_user', JSON.stringify(defaultUser));
    setUser(defaultUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    return Promise.resolve(defaultUser);
  };

  const logout = () => {
    // No-op to prevent logging out
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        loading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
