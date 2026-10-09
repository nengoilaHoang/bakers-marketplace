import request from '@/lib/api';
import { User } from '@/types/user';

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
