
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage to persist login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sflex_auth') === 'true';
  });
  const [user, setUser] = useState<{ username: string } | null>(() => {
    const storedUser = localStorage.getItem('sflex_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });


  const login = async (username: string, pass: string): Promise<void> => {
    // Hardcoded superadmin credentials
    if (username === 'sport.flex' && pass === 'superpass123') {
      setIsAuthenticated(true);
      const userData = { username };
      setUser(userData);
      localStorage.setItem('sflex_auth', 'true');
      localStorage.setItem('sflex_user', JSON.stringify(userData));
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('sflex_auth');
    localStorage.removeItem('sflex_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
