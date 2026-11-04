import useAuth from '@/hooks/user/useAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Chỉ tài khoản ADMIN vào được khu /admin; người khác bị đưa về trang chủ.
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { account, isAuthenticating: isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && account?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [account, isLoading, router]);

  if (isLoading || account?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
