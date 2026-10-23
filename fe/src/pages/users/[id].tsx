import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Alert from '@/components/ui/Alert';

import useAuth from '@/hooks/user/useAuthContext';
import { useDropdown } from '@/hooks/useDropdown';
import request, { ApiError } from '@/lib/api';

type PublicProfile = {
  id: string;
  displayName: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  following: boolean;
};

const REPORT_REASONS = [
  ['SPAM', 'Spam'],
  ['HARASSMENT', 'Quấy rối'],
  ['INAPPROPRIATE_CONTENT', 'Nội dung không phù hợp'],
  ['IMPERSONATION', 'Mạo danh'],
  ['OTHER', 'Lý do khác'],
];

export default function UserProfilePage() {
  const router = useRouter();
  const { account, isAuthenticating } = useAuth();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const profileKey = `${id}:${account?.id ?? 'guest'}`;
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    attempt: number;
    profile: PublicProfile | null;
    error: string;
  } | null>(null);
  const [action, setAction] = useState({ key: '', busy: '', error: '', success: '' });
  const [reason, setReason] = useState('SPAM');
  const [description, setDescription] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const reportMenuButton = useRef<HTMLButtonElement>(null);
  const { ref: reportMenuRef, isOpen: isReportMenuOpen, toggle: toggleReportMenu, close: closeReportMenu } = useDropdown();
  const mutation = useRef<AbortController | null>(null);
  const profile = loaded?.key === profileKey && loaded.attempt === attempt ? loaded.profile : null;
  const loadError = loaded?.key === profileKey && loaded.attempt === attempt ? loaded.error : '';
  const currentAction = action.key === profileKey ? action : null;
  const busy = Boolean(currentAction?.busy);
  const isSelf = account?.id === profile?.id;

  useEffect(() => {
    if (!router.isReady || !id || isAuthenticating) return;
    const controller = new AbortController();
    void request<{ data: PublicProfile }>(`/users/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setLoaded({ key: profileKey, attempt, profile: data, error: '' });
          setAction({ key: profileKey, busy: '', error: '', success: '' });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoaded({ key: profileKey, attempt, profile: null, error:
            error instanceof ApiError && (error.status === 404 || error.status === 400)
              ? 'Không tìm thấy người dùng.'
              : 'Không thể tải hồ sơ. Vui lòng thử lại.',
          });
        }
      });
    return () => controller.abort();
  }, [router.isReady, id, isAuthenticating, profileKey, attempt]);

  useEffect(() => {
    dialog.current?.close();
    closeReportMenu();
    return () => {
      mutation.current?.abort();
      mutation.current = null;
    };
  }, [profileKey, closeReportMenu]);

  function requireLogin() {
    void router.push({ pathname: '/authen/login', query: { next: `/users/${id}` } });
  }

  async function toggleFollow() {
    if (!profile || mutation.current) return;
    if (!account) { requireLogin(); return; }
    const controller = new AbortController();
    mutation.current = controller;
    setAction({ key: profileKey, busy: 'follow', error: '', success: '' });
    try {
      const { data } = await request<{ data: { following: boolean; followerCount: number } }>(
        `/users/${profile.id}/follow`, {
          method: profile.following ? 'DELETE' : 'POST',
          signal: controller.signal,
        },
      );
      if (controller.signal.aborted) return;
      setLoaded((current) => current?.key === profileKey && current.profile
        ? { ...current, profile: { ...current.profile, ...data } } : current);
      setAction({ key: profileKey, busy: '', error: '', success: data.following ? 'Đã theo dõi người dùng.' : 'Đã bỏ theo dõi.' });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) requireLogin();
      setAction({ key: profileKey, busy: '', error:
        error instanceof ApiError ? error.message : 'Không thể cập nhật theo dõi. Vui lòng thử lại.', success: '' });
    } finally {
      if (mutation.current === controller) mutation.current = null;
    }
  }

  function openReport() {
    closeReportMenu();
    if (!account) { requireLogin(); return; }
    if (mutation.current) return;
    setAction({ key: profileKey, busy: '', error: '', success: '' });
    setReason('SPAM');
    setDescription('');
    setIsReportOpen(true);
    dialog.current?.showModal();
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || mutation.current) return;
    if (!account) { requireLogin(); return; }
    const controller = new AbortController();
    mutation.current = controller;
    setAction({ key: profileKey, busy: 'report', error: '', success: '' });
    try {
      await request(`/users/${profile.id}/reports`, {
        method: 'POST',
        body: JSON.stringify({ reason, description: description.trim() }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      dialog.current?.close();
      setAction({ key: profileKey, busy: '', error: '', success: 'Đã ghi nhận báo cáo của bạn.' });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) requireLogin();
      setAction({ key: profileKey, busy: '', error:
        error instanceof ApiError ? error.message : 'Không thể gửi báo cáo. Vui lòng thử lại.', success: '' });
    } finally {
      if (mutation.current === controller) mutation.current = null;
    }
  }

  return (
    <div className='min-h-screen bg-white text-black' style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Head><title>{profile ? `${profile.displayName} · Hồ sơ` : 'Hồ sơ người dùng'}</title></Head>
      <nav aria-label='Điều hướng' className='flex flex-wrap justify-between gap-4 border-b border-black px-6 py-5'>
        <Link href='/' className='underline underline-offset-4'>← Diễn đàn</Link>
        {account && <Link href='/me' className='underline underline-offset-4'>Tài khoản của tôi</Link>}
      </nav>
      <main className='mx-auto max-w-2xl px-6 py-12' aria-busy={!profile && !loadError}>
        {!profile && !loadError && <Alert appearance='neutral'>Đang tải hồ sơ…</Alert>}
        {loadError && (
          <div>
            <h1 className='text-2xl font-semibold'>Hồ sơ người dùng</h1>
            <Alert tone='danger' appearance='neutral' className='mt-4'>{loadError}</Alert>
            <button type='button' onClick={() => setAttempt((value) => value + 1)} className='mt-4 border border-black px-4 py-2'>Thử lại</button>
          </div>
        )}
        {profile && (
          <>
            <div className='flex items-center gap-5'>
              <div aria-hidden className='flex size-20 shrink-0 items-center justify-center rounded-full border border-black text-3xl'>
                {Array.from(profile.displayName)[0]?.toLocaleUpperCase('vi-VN')}
              </div>
              <div className='min-w-0'>
                <h1 className='break-words text-3xl font-semibold'>{profile.displayName}</h1>
                <p className='mt-3 text-sm text-neutral-600'>
                  {profile.followerCount.toLocaleString('vi-VN')} người theo dõi · {profile.followingCount.toLocaleString('vi-VN')} đang theo dõi
                </p>
              </div>
            </div>
            {currentAction?.success && <Alert tone='success' appearance='neutral' className='mt-6'>{currentAction.success}</Alert>}
            {currentAction?.error && !isReportOpen && <Alert tone='danger' appearance='neutral' className='mt-6'>{currentAction.error}</Alert>}
            <div className='mt-8 flex flex-wrap items-start gap-3'>
              {isSelf ? (
                <Link href='/me' className='border border-black px-5 py-2'>Quản lý tài khoản</Link>
              ) : (
                <>
                  <button type='button' disabled={busy} aria-pressed={profile.following} onClick={() => void toggleFollow()}
                    className={`border border-black px-5 py-2 disabled:opacity-50 ${profile.following ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {currentAction?.busy === 'follow' ? 'Đang cập nhật…' : profile.following ? 'Following' : 'Follow'}
                  </button>
                  <div ref={reportMenuRef} className='relative'
                    onKeyDown={(event) => { if (event.key === 'Escape') reportMenuButton.current?.focus(); }}>
                    <button ref={reportMenuButton} type='button' disabled={busy} onClick={toggleReportMenu}
                      aria-label='Thao tác với người dùng' aria-expanded={isReportMenuOpen} aria-controls='profile-report-menu'
                      className='border border-black px-4 py-2 disabled:opacity-50'>…</button>
                    {isReportMenuOpen && (
                      <button id='profile-report-menu' type='button' disabled={busy} onClick={openReport}
                        className='absolute top-full right-0 z-10 mt-2 w-60 border border-black bg-white px-4 py-3 text-left disabled:opacity-50'>
                        Báo cáo người dùng
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            {!account && <p className='mt-6 text-sm text-neutral-600'>Đăng nhập để theo dõi hoặc báo cáo người dùng.</p>}
          </>
        )}
      </main>
      <dialog ref={dialog} aria-labelledby='report-title' aria-describedby='report-help'
        onCancel={(event) => { if (mutation.current) event.preventDefault(); }}
        onClose={() => { setIsReportOpen(false); reportMenuButton.current?.focus(); }}
        className='fixed inset-0 m-auto w-[calc(100%-3rem)] max-w-lg border border-black bg-white p-6 text-black backdrop:bg-black/40'>
        <form onSubmit={submitReport}>
          <h2 id='report-title' className='text-xl font-semibold'>Báo cáo người dùng</h2>
          <p id='report-help' className='mt-2 text-sm text-neutral-600'>Chọn lý do báo cáo {profile?.displayName}.</p>
          {currentAction?.error && <Alert tone='danger' appearance='neutral' className='mt-4'>{currentAction.error}</Alert>}
          <label htmlFor='report-reason' className='mt-6 block text-sm font-medium'>Lý do</label>
          <select id='report-reason' required autoFocus disabled={busy} value={reason} onChange={(event) => setReason(event.target.value)}
            className='mt-2 w-full border border-black bg-white p-3'>
            {REPORT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor='report-description' className='mt-4 block text-sm font-medium'>Mô tả thêm (tùy chọn)</label>
          <textarea id='report-description' rows={4} maxLength={2000} disabled={busy} value={description}
            onChange={(event) => setDescription(event.target.value)} className='mt-2 w-full border border-black p-3' />
          <p className='mt-1 text-right text-xs text-neutral-600'>{description.length}/2000</p>
          <div className='mt-6 flex justify-end gap-3'>
            <button type='button' disabled={busy} onClick={() => dialog.current?.close()} className='border border-black px-4 py-2 disabled:opacity-50'>Hủy</button>
            <button type='submit' disabled={busy} className='border border-black bg-black px-4 py-2 text-white disabled:opacity-50'>
              {currentAction?.busy === 'report' ? 'Đang gửi…' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
