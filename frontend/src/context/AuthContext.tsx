import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  accounts: User[];
  login: (user: User) => void;
  logout: () => void;
  addAccount: (user: User) => void;
  switchAccount: (userId: string) => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUser: User = {
  id: 'user-1',
  name: 'Aditya Dubey',
  email: 'aditya@example.com',
  plan: 'Free Plan',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [accounts, setAccounts] = useState<User[]>([defaultUser]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addAccount = (newAccount: User) => {
    setAccounts(prev => [...prev, newAccount]);
  };

  const switchAccount = (userId: string) => {
    const account = accounts.find(a => a.id === userId);
    if (account) {
      setUser(account);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, accounts, login, logout, addAccount, switchAccount, updateUser }}>
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
