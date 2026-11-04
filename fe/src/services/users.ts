import request from '@/lib/api';
import type { PublicProfile, User } from '@/types/user';

export async function getSession() {
  const res = await request<{ data: User }>('/authen/session');
  return res.data;
}

export async function normalLogin(email: string, password: string) {
  const res = await request<{ data: User }>('/authen/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function googleLogin(code: string, redirectUri: string) {
  const res = await request<{ data: User }>('/authen/login/google', {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri }),
  });
  return res.data;
}

export async function googleRegister(
  authorizationCode: string,
  redirectUri: string,
  normalizedDisplayName: string,
) {
  const res = await request<{ data: User }>('/authen/register/google', {
    method: 'POST',
    body: JSON.stringify({
      code: authorizationCode,
      redirectUri: redirectUri,
      displayName: normalizedDisplayName,
    }),
  });
  return res.data;
}

export async function getUserProfile(
  id: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<PublicProfile> {
  const res = await request<{ data: PublicProfile }>(`/users/${encodeURIComponent(id)}`, {
    signal,
  });
  return res.data;
}

// Báo cáo một người dùng (mỗi người chỉ có một báo cáo đang chờ với cùng một người).
export async function reportUser(id: string, reason: string): Promise<void> {
  await request(`/users/${encodeURIComponent(id)}/reports`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
