import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mock user data for development
  const [user, setUser] = useState({
    id: 'temp_user_123',
    email: 'testuser@example.com',
    token: 'mock_jwt_token',
    role: 'customer'
  });

  // Mock login/logout functions
  const login = (credentials) => {
    console.log('Mock login with:', credentials);
    return Promise.resolve({
      id: 'temp_user_123',
      email: credentials.email || 'testuser@example.com',
      token: 'mock_jwt_token'
    });
  };

  const logout = () => {
    console.log('Mock logout');
    setUser(null);
    return Promise.resolve();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}