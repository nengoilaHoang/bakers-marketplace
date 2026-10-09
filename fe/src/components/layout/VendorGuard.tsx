import useAuth from '@/hooks/user/useAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VendorGuard = ({ children }: { children: React.ReactNode }) => {
  const { account, isAuthenticating: isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && account?.role !== 'VENDOR') {
      router.replace('/');
    }
  }, [account, isLoading, router]);

  if (isLoading) return null;

  if (account?.role !== 'VENDOR') {
    return null;
  }

  return <>{children}</>;
};

export default VendorGuard;
