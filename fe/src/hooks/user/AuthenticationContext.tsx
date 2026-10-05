import { User } from '@/types/user';
import { createContext } from 'react';

type AuthenticationContextValues = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthenticationContext = createContext<AuthenticationContextValues | null>(
  null,
);

export default AuthenticationContext;
