import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import Alert, { type AlertTone } from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import Button, { ButtonLink } from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import RatingStars, { RatingInput } from '@/components/ui/RatingStars';
import useAuth from '@/hooks/user/useAuthContext';
import { ApiError } from '@/lib/api';
import { createRecipeRating, deleteRecipeRating, getRecipeRatings, updateRecipeRating } from '@/services/recipes';
import type { RecipeRatingsPage } from '@/types/recipe';
import { formatDateTime } from '@/utils/format';

export default function RecipeRatings({ recipeId, ownerId }: { recipeId: string; ownerId?: string | null }) {
  const router = useRouter();
  const { account, isAuthenticating } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${recipeId}:${account?.id ?? 'guest'}:${attempt}`;
  const [loaded, setLoaded] = useState<{
    key: string; page: RecipeRatingsPage | null; error: string; unavailable: boolean;
  } | null>(null);
  const [draft, setDraft] = useState<{ key: string; rating: number; comment: string } | null>(null);
  const [action, setAction] = useState<{
    key: string; busy: '' | 'save' | 'delete' | 'more'; tone: AlertTone; message: string;
  }>({ key: '', busy: '', tone: 'info', message: '' });
  const pending = useRef<AbortController | null>(null);
  const current = loaded?.key === requestKey ? loaded : null;
  const page = current?.page;
  const status = action.key === requestKey ? action : null;
  const busy = Boolean(status?.busy);
  const myRating = page?.myRating ?? null;
  const rating = draft?.key === requestKey ? draft.rating : myRating?.rating ?? 0;
  const comment = draft?.key === requestKey ? draft.comment : myRating?.comment ?? '';
  const isOwner = Boolean(account && account.id === ownerId);
  const loginHref = `/authen/login?next=${encodeURIComponent(`/recipes/${recipeId}#ratings`)}`;

  useEffect(() => {
    if (isAuthenticating) return;
    const controller = new AbortController();
    void getRecipeRatings(recipeId, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setLoaded({ key: requestKey, page: data, error: '', unavailable: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoaded({ key: requestKey, page: null,
          error: error instanceof ApiError ? error.message : 'Không thể tải đánh giá. Vui lòng thử lại.',
          unavailable: error instanceof ApiError && error.status === 404,
        });
      });
    return () => controller.abort();
  }, [recipeId, requestKey, isAuthenticating]);

  useEffect(() => () => {
    pending.current?.abort();
    pending.current = null;
  }, [requestKey]);

  async function loadMore() {
    if (!page?.nextCursor || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setAction({ key: requestKey, busy: 'more', tone: 'info', message: '' });
    try {
      const data = await getRecipeRatings(recipeId, { cursor: page.nextCursor, signal: controller.signal });
      if (controller.signal.aborted) return;
      setLoaded((previous) => {
        if (previous?.key !== requestKey || !previous.page) return previous;
        const existing = new Set(previous.page.reviews.map((review) => review.id));
        return { ...previous, page: { ...previous.page, summary: data.summary,
          reviews: [...previous.page.reviews, ...data.reviews.filter((review) => !existing.has(review.id))],
          nextCursor: data.nextCursor,
        } };
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 404) {
        setLoaded({ key: requestKey, page: null, error: 'Công thức đã bị xóa hoặc chuyển sang riêng tư.', unavailable: true });
      }
      setAction({ key: requestKey, busy: '', tone: 'danger', message: 'Không thể tải thêm đánh giá. Vui lòng thử lại.' });
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setAction((previous) => previous.key === requestKey ? { ...previous, busy: '' } : previous);
      }
    }
  }

  async function mutate(kind: 'save' | 'delete') {
    if (!page || pending.current || isOwner) return;
    if (!account) { void router.push(loginHref); return; }
    if (kind === 'save' && (!Number.isFinite(rating) || rating < 1 || rating > 5 || comment.trim().length > 2000)) {
      setAction({ key: requestKey, busy: '', tone: 'danger', message: 'Chọn từ 1 đến 5 sao và nhận xét tối đa 2.000 ký tự.' });
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setAction({ key: requestKey, busy: kind, tone: 'info', message: '' });
    try {
      const payload = { rating, comment: comment.trim() || null };
      const receipt = kind === 'delete'
        ? await deleteRecipeRating(recipeId, controller.signal)
        : myRating
          ? await updateRecipeRating(recipeId, payload, controller.signal)
          : await createRecipeRating(recipeId, payload, controller.signal);
      if (controller.signal.aborted) return;
      setDraft({ key: requestKey, rating: receipt.myRating?.rating ?? 0, comment: receipt.myRating?.comment ?? '' });
      // Keep the displayed list consistent even if the following refresh fails.
      setLoaded((previous) => {
        if (previous?.key !== requestKey || !previous.page) return previous;
        const mine = receipt.myRating;
        let reviews = previous.page.reviews.filter((review) => kind !== 'delete' || review.rater.id !== account.id);
        if (mine) reviews = myRating
          ? reviews.map((review) => review.id === mine.id ? mine : review)
          : [mine, ...reviews];
        return { ...previous, page: { ...previous.page, ...receipt, reviews } };
      });
      setAction({ key: requestKey, busy: kind, tone: 'success', message: kind === 'delete' ? 'Đã xóa đánh giá của bạn.' : 'Đã lưu đánh giá của bạn.' });
      try {
        const fresh = await getRecipeRatings(recipeId, { signal: controller.signal });
        if (!controller.signal.aborted) setLoaded({ key: requestKey, page: fresh, error: '', unavailable: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 404) {
          setLoaded({ key: requestKey, page: null, error: 'Công thức đã bị xóa hoặc chuyển sang riêng tư.', unavailable: true });
        } else {
          setAction({ key: requestKey, busy: '', tone: 'warning', message: 'Thay đổi đã được lưu nhưng chưa tải lại được danh sách. Vui lòng thử tải lại đánh giá.' });
        }
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setAction({ key: requestKey, busy: '', tone: 'danger', message: error instanceof ApiError ? error.message : 'Không thể cập nhật đánh giá. Vui lòng thử lại.' });
      if (error instanceof ApiError && error.status === 401) void router.push(loginHref);
      if (error instanceof ApiError && (error.status === 404 || error.status === 409)) {
        // Another tab may have changed this rating or the recipe visibility.
        try {
          const fresh = await getRecipeRatings(recipeId, { signal: controller.signal });
          if (!controller.signal.aborted) {
            setLoaded({ key: requestKey, page: fresh, error: '', unavailable: false });
          }
        } catch (reloadError) {
          if (!controller.signal.aborted && reloadError instanceof ApiError && reloadError.status === 404) {
            setLoaded({ key: requestKey, page: null, error: 'Công thức đã bị xóa hoặc chuyển sang riêng tư.', unavailable: true });
          }
        }
      }
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setAction((previous) => previous.key === requestKey ? { ...previous, busy: '' } : previous);
      }
    }
  }

  return (
    <section id='ratings' aria-labelledby='recipe-ratings-title' className='mt-14 border-t border-line pt-10'>
      <h2 id='recipe-ratings-title' className='text-h2 font-semibold text-ink'>Đánh giá công thức</h2>
      {!current && <Alert className='mt-5'>Đang tải đánh giá…</Alert>}
      {current?.error && <Alert tone={current.unavailable ? 'warning' : 'danger'} className='mt-5'
        action={!current.unavailable && <Button variant='outline' size='sm' onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>}>
        {current.error}
      </Alert>}
      {page && (
        <div className='mt-6 flex flex-col gap-8'>
          <div className='grid gap-6 border border-line p-5 sm:grid-cols-2'>
            <div>
              <RatingStars value={page.summary.average} count={page.summary.count} size='lg' valuePosition='end' />
              <p className='mt-2 text-body-sm text-ink-muted'>{page.summary.count ? `${page.summary.average}/5 · ${page.summary.count} lượt đánh giá` : 'Chưa có đánh giá nào.'}</p>
            </div>
            <dl className='flex flex-col gap-2'>
              {(['5', '4', '3', '2', '1'] as const).map((star) => (
                <div key={star} className='flex items-center gap-3 text-body-sm'>
                  <dt className='w-10 shrink-0'>{star} sao</dt>
                  <dd className='flex flex-1 items-center gap-3'>
                    <progress className='h-2 w-full accent-black' value={page.summary.distribution[star]} max={page.summary.count || 1}
                      aria-label={`${star} sao: ${page.summary.distribution[star]} lượt`} />
                    <span className='w-8 shrink-0 text-right'>{page.summary.distribution[star]}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className='text-caption text-ink-muted sm:col-span-2'>Điểm lẻ được xếp vào nhóm sao gần nhất.</p>
          </div>
          {status?.message && <Alert tone={status.tone} action={status.tone === 'warning'
            && <Button variant='outline' size='sm' disabled={busy} onClick={() => setAttempt((value) => value + 1)}>Tải lại đánh giá</Button>}>
            {status.message}
          </Alert>}
          {isOwner ? <Alert>Bạn là tác giả công thức này nên không thể tự đánh giá. Bạn vẫn có thể xem nhận xét của mọi người.</Alert>
            : !account ? <Alert action={<ButtonLink href={loginHref} variant='outline' size='sm'>Đăng nhập để đánh giá</ButtonLink>}>Đăng nhập để chấm sao và chia sẻ nhận xét.</Alert>
              : <form onSubmit={(event) => { event.preventDefault(); void mutate('save'); }} className='flex flex-col items-start gap-5 border border-line p-5'>
                <h3 className='text-h4 font-medium'>{myRating ? 'Đánh giá của bạn' : 'Viết đánh giá'}</h3>
                <RatingInput name={`recipe-rating-${recipeId}`} label='Chấm điểm công thức' value={rating} disabled={busy}
                  onChange={(value) => setDraft({ key: requestKey, rating: value, comment })} />
                <Field label='Điểm từ 1 đến 5 (có thể nhập điểm lẻ)' htmlFor={`recipe-rating-score-${recipeId}`}>
                  <Input id={`recipe-rating-score-${recipeId}`} type='number' min={1} max={5} step='any' required
                    value={rating || ''} disabled={busy}
                    onChange={(event) => setDraft({ key: requestKey, rating: event.target.valueAsNumber || 0, comment })} />
                </Field>
                <Field label='Nhận xét (tùy chọn)' htmlFor={`recipe-review-${recipeId}`} className='w-full'>
                  <Textarea id={`recipe-review-${recipeId}`} maxLength={2000} rows={4} value={comment} disabled={busy}
                    placeholder='Chia sẻ cảm nhận của bạn về công thức…'
                    onChange={(event) => setDraft({ key: requestKey, rating, comment: event.target.value })} />
                </Field>
                <p className='text-caption text-ink-muted'>{comment.length}/2000 ký tự</p>
                <div className='flex flex-wrap gap-3'>
                  <Button type='submit' variant='outline' disabled={busy}>{status?.busy === 'save' ? 'Đang lưu…' : myRating ? 'Lưu đánh giá' : 'Gửi đánh giá'}</Button>
                  {myRating && <Button variant='outline' disabled={busy} onClick={() => void mutate('delete')}>{status?.busy === 'delete' ? 'Đang xóa…' : 'Xóa đánh giá'}</Button>}
                </div>
              </form>}
          <div>
            <h3 className='text-h4 font-medium'>Nhận xét</h3>
            {page.reviews.length === 0 ? <p className='mt-4 text-body-sm text-ink-muted'>Hãy là người đầu tiên đánh giá công thức này.</p>
              : <ul className='mt-4 divide-y divide-line border-y border-line'>
                {page.reviews.map((review) => <li key={review.id} className='flex gap-4 py-5'>
                  <Avatar size='sm' label={`Ảnh đại diện ${review.rater.displayName}`} />
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <Link href={`/users/${review.rater.id}`} className='font-medium hover:underline'>{review.rater.displayName}{review.rater.id === account?.id ? ' (Bạn)' : ''}</Link>
                      <RatingStars value={review.rating} valuePosition='none' size='md' />
                      <time dateTime={review.ratedAt} className='text-caption text-ink-muted'>{formatDateTime(review.ratedAt)}</time>
                      {review.updatedAt !== review.ratedAt && <span className='text-caption text-ink-muted'>Đã chỉnh sửa</span>}
                    </div>
                    <p className='mt-3 text-body-sm break-words whitespace-pre-wrap text-ink-muted'>{review.comment || 'Không có nhận xét.'}</p>
                    {review.media.length > 0 && <ul className='mt-3 flex flex-wrap gap-3' aria-label='Ảnh đính kèm đánh giá'>
                      {review.media.map((image) => <li key={image.id}>
                        <a href={image.url} target='_blank' rel='noopener noreferrer'>
                          <Image src={image.url} alt={image.displayName || 'Ảnh đính kèm đánh giá'}
                            width={image.width || 160} height={image.height || 120} unoptimized
                            className='h-24 w-32 border border-line object-cover' />
                        </a>
                      </li>)}
                    </ul>}
                  </div>
                </li>)}
              </ul>}
            {page.nextCursor && <Button variant='outline' className='mt-5' disabled={busy} onClick={() => void loadMore()}>{status?.busy === 'more' ? 'Đang tải…' : 'Xem thêm đánh giá'}</Button>}
          </div>
        </div>
      )}
    </section>
  );
}
