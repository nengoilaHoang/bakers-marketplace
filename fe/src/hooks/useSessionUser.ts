import { useEffect, useState } from 'react';

import request from '@/lib/api';

export type SessionAccount = {
  id: string;
  displayName: string;
  email: string;
};

// Thông tin tài khoản đang đăng nhập (null khi chưa tải xong hoặc chưa đăng nhập).
export function useSessionUser() {
  const [account, setAccount] = useState<SessionAccount | null>(null);

  useEffect(() => {
    let isActive = true;

    void request<{ data: SessionAccount }>('/authen/session')
      .then(({ data }) => {
        if (isActive) setAccount(data);
      })
      .catch(() => {
        // Proxy đã chặn khách ở các trang cần đăng nhập; lỗi ở đây chỉ làm thiếu tên/email.
      });

    return () => {
      isActive = false;
    };
  }, []);

  return account;
}
