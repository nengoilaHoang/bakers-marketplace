import Link from 'next/link';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { getUserProfile, reportUser } from '@/services/users';
import type { PublicProfile, UserRole } from '@/types/user';
import { formatDate } from '@/utils/format';

// Vai trò đáng nêu trên hồ sơ; khách hàng thường không cần nhãn.
const ROLE_LABELS: Partial<Record<UserRole, string>> = {
  VENDOR: 'Cửa hàng',
  BAKER: 'Thợ làm bánh',
  ADMIN: 'Quản trị viên',
};

type Notice = { tone: 'success' | 'danger'; text: string };

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

function ReportUserForm({ profile }: { profile: PublicProfile }) {
  const [reason, setReason] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) return;

    setIsSending(true);
    setNotice(null);

    try {
      await reportUser(profile.id, reason.trim());
      setReason('');
      setNotice({ tone: 'success', text: 'Đã gửi báo cáo. Cảm ơn bạn!' });
    } catch (error) {
      setNotice({ tone: 'danger', text: getErrorMessage(error) });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <details className='rounded-box border border-line px-5 py-4'>
      <summary className='flex cursor-pointer list-none items-center gap-2 rounded-control text-body-sm text-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-accent'>
        <Icon name='flag' className='size-4' />
        Báo cáo người dùng
      </summary>
      <form onSubmit={handleSubmit} className='mt-4 flex flex-col gap-3'>
        <Field label='Lý do' htmlFor={`report-user-${profile.id}`} size='sm'>
          <Textarea
            id={`report-user-${profile.id}`}
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder='Ví dụ: lời lẽ thô tục, quấy rối, giả mạo...'
            disabled={isSending}
          />
        </Field>
        <div>
          <Button type='submit' variant='outline' size='sm' disabled={isSending || !reason.trim()}>
            {isSending ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </div>
        {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      </form>
    </details>
  );
}

function ProfileContent({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId: string | null;
}) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getUserProfile(userId, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setProfile(data);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(getErrorMessage(requestError));
      });

    return () => controller.abort();
  }, [userId]);

  if (error) {
    return <Alert tone='danger'>{error}</Alert>;
  }

  if (!profile) {
    return (
      <div role='status' aria-label='Đang tải hồ sơ' className='flex items-center gap-4'>
        <div className='size-22 animate-pulse rounded-full bg-surface-soft' />
        <div className='h-6 flex-1 animate-pulse rounded-control bg-surface-soft' />
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[profile.role];
  const isSelf = currentUserId === profile.id;

  return (
    <>
      <div className='flex items-center gap-5'>
        <Avatar size='md' label={`Ảnh đại diện ${profile.displayName}`} />
        <div className='flex min-w-0 flex-col gap-1.5'>
          <p className='text-h5 font-semibold wrap-break-word text-ink'>{profile.displayName}</p>
          {roleLabel && (
            <span>
              <Badge tone='secondary'>{roleLabel}</Badge>
            </span>
          )}
          <p className='text-caption font-light text-ink-muted'>
            Tham gia từ {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-3 rounded-panel bg-highlight px-5 py-4 text-center'>
        <div>
          <dt className='text-meta text-ink-muted uppercase'>Bài viết</dt>
          <dd className='text-h4 font-semibold text-ink'>{profile.postCount}</dd>
        </div>
        <div>
          <dt className='text-meta text-ink-muted uppercase'>Công thức</dt>
          <dd className='text-h4 font-semibold text-ink'>{profile.recipeCount}</dd>
        </div>
      </dl>

      {isSelf ? null : currentUserId ? (
        <ReportUserForm profile={profile} />
      ) : (
        <p className='text-body-sm font-light text-ink-muted'>
          <Link href='/authen/login' className='font-medium text-ink underline'>
            Đăng nhập
          </Link>{' '}
          để báo cáo người dùng này.
        </p>
      )}
    </>
  );
}

type AuthorProfileButtonProps = Readonly<{
  // null: tài khoản đã bị xoá, chỉ hiện chữ, không bấm được.
  author: { id: string; displayName: string } | null;
  currentUserId: string | null;
  // Nội dung hiển thị của nút (giữ nguyên kiểu chữ nơi đặt nút).
  children: ReactNode;
}>;

// Tên tác giả bấm được: mở hộp hồ sơ công khai, có chỗ báo cáo người dùng.
export default function AuthorProfileButton({
  author,
  currentUserId,
  children,
}: AuthorProfileButtonProps) {
  const [open, setOpen] = useState(false);

  if (!author) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-haspopup='dialog'
        className='cursor-pointer rounded-tick text-left underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent'
      >
        {children}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title='Hồ sơ'>
        {open && <ProfileContent userId={author.id} currentUserId={currentUserId} />}
      </Modal>
    </>
  );
}
