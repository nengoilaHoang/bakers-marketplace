import request, { ApiError } from '@/lib/api';
import { getSession } from '@/services/users';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthenticationContext from './AuthenticationContext';

const AuthenticationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [account, setAccount] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const userData = await getSession();
      setAccount(userData);
      return userData;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAccount(null);
        return null;
      }
      console.error('Failed to load session:', error);
      setAccount(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const initAuth = async () => {
      try {
        setIsAuthenticating(true);
        await fetchSession();
      } finally {
        if (isActive) {
          setIsAuthenticating(false);
        }
      }
    };

    void initAuth();

    return () => {
      isActive = false;
    };
  }, [fetchSession]);

  const logout = useCallback(async () => {
    try {
      await request('/authen/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setAccount(null);
      router.replace('/authen/login');
    }
  }, [router]);

  const value = useMemo(
    () => ({
      account,
      setAccount,
      isAuthenticating,
      isAuthenticated: Boolean(account),
      logout,
    }),
    [isAuthenticating, logout, account],
  );

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationProvider;
