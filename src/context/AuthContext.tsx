import { createContext, useContext, useState, type ReactNode } from 'react';

type UserRole = 'CITIZEN' | 'WORKER' | 'ADMIN';

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    let mockUser: User;
    switch (role) {
      case 'WORKER':
        mockUser = { id: 'worker_001', name: 'Field Worker Bob', role: 'WORKER' };
        break;
      case 'ADMIN':
        mockUser = { id: 'admin_001', name: 'City Official Alice', role: 'ADMIN' };
        break;
      case 'CITIZEN':
      default:
        mockUser = { id: 'citizen_123', name: 'John Doe', role: 'CITIZEN' };
        break;
    }
    setUser(mockUser);
    localStorage.setItem('user_role', role); // Simple persistence
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_role');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
