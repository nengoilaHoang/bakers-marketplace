import { User } from '@/types/user';
import { createContext } from 'react';

type AuthenticationContextValues = {
  account: User | null;
  setAccount: (user: User | null) => void;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthenticationContext = createContext<AuthenticationContextValues | null>(
  null,
);

export default AuthenticationContext;
