import { getSession } from '@/services/users';
import { User } from '@/types/user';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthenticationContext from './AuthenticationContext';
import { useRouter } from 'next/navigation';
import request, { ApiError } from '@/lib/api';

const AuthenticationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const userData = await getSession();
      setUser(userData);
      return userData;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        return null;
      }
      console.error('Failed to load session:', error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const initAuth = async () => {
      try {
        await fetchSession();
      } finally {
        if (isActive) {
          setIsLoading(false);
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
      setUser(null);
      router.replace('/authen/login');
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isLoading,
      isAuthenticated: Boolean(user),
      logout,
    }),
    [isLoading, logout, user],
  );

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationProvider;
