import useAuth from '@/hooks/user/useAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VendorGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'VENDOR') {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  if (user?.role !== 'VENDOR') {
    return null;
  }

  return <>{children}</>;
};

export default VendorGuard;
