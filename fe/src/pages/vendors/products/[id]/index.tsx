import { useRouter } from 'next/router';
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import StockStatusBadge from '@/components/stock/StockStatusBadge';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Panel, { PanelSkeleton } from '@/components/vendor/Panel';
import RemovableTag from '@/components/vendor/RemovableTag';
import VendorPage from '@/components/vendor/VendorPage';
import type { NextPageWithLayout } from '@/pages/_app';
import { collectionApi, type Collection } from '@/services/collections';
import { productApi, type Product } from '@/services/products';
import { formatDate, formatMoney } from '@/utils/format';
import { getStockStatus } from '@/utils/stockStatus';

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-4 sm:gap-4'>
      <dt className='text-body-sm text-ink-muted'>{label}</dt>
      <dd className='text-body-sm text-ink sm:col-span-3'>{children}</dd>
    </div>
  );
}

const ProductDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [tagName, setTagName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [collectionId, setCollectionId] = useState('');

  const load = useCallback(async () => {
    if (!id) return;

    try {
      const [productResponse, collectionsResponse] = await Promise.all([
        productApi.getById(id),
        collectionApi.getAll(),
      ]);
      setProduct(productResponse.data);
      setCollections(collectionsResponse.data);
      setLoadError(null);
    } catch (error) {
      setLoadError((error as Error).message);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // Chạy một thao tác (thêm/xoá tag, ghi chú, bộ sưu tập) rồi tải lại sản phẩm.
  async function run(action: () => Promise<unknown>) {
    setIsBusy(true);
    setActionError(null);

    try {
      await action();
      await load();
    } catch (error) {
      setActionError((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  const breadcrumb = [
    { label: 'Sản phẩm', href: '/vendors/products' },
    { label: product?.title ?? 'Chi tiết' },
  ];

  if (loadError) {
    return (
      <VendorPage title='Sản phẩm' breadcrumb={breadcrumb}>
        <ErrorState
          title='Không thể tải sản phẩm'
          message={loadError}
          onRetry={() => void load()}
        />
      </VendorPage>
    );
  }

  if (!product) {
    return (
      <VendorPage title='Sản phẩm' breadcrumb={breadcrumb}>
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
          <PanelSkeleton className='h-96' />
          <PanelSkeleton className='h-64' />
        </div>
      </VendorPage>
    );
  }

  const stock = product.stock?.stock ?? 0;
  const status = getStockStatus(stock, product.stock?.alerts ?? []);
  const assignedIds = new Set(
    product.collections.map((collection) => collection.id),
  );
  const availableCollections = collections.filter(
    (collection) => !assignedIds.has(collection.id),
  );

  function handleAddTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !tagName.trim()) return;
    void run(async () => {
      await productApi.addTag(product.id, tagName.trim());
      setTagName('');
    });
  }

  function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !noteContent.trim()) return;
    void run(async () => {
      await productApi.addNote(product.id, noteContent.trim());
      setNoteContent('');
    });
  }

  function handleAssignCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !collectionId) return;
    void run(async () => {
      await productApi.assignToCollection(product.id, collectionId);
      setCollectionId('');
    });
  }

  return (
    <VendorPage
      title={product.title}
      breadcrumb={breadcrumb}
      description={product.description || undefined}
      actions={
        <ButtonLink href={`/vendors/products/${product.id}/edit`} size='sm'>
          <Icon name='edit' className='size-4' />
          Sửa sản phẩm
        </ButtonLink>
      }
    >
      {actionError && <Alert tone='danger'>{actionError}</Alert>}

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        {/* Cột chính */}
        <div className='flex flex-col gap-6'>
          <Panel title='Thông tin'>
            <dl>
              <InfoRow label='Giá bán'>
                {formatMoney(product.unitPrice, product.currency)}
              </InfoRow>
              <InfoRow label='Giá vốn'>
                {formatMoney(product.unitCost, product.currency)}
              </InfoRow>
              <InfoRow label='Đơn vị'>{product.unit}</InfoRow>
              <InfoRow label='Slug'>{product.slug}</InfoRow>
              <InfoRow label='Hạn sử dụng'>
                {formatDate(product.expirationDate) ?? '—'}
              </InfoRow>
              <InfoRow label='Ngày tạo'>
                {formatDate(product.createdAt) ?? '—'}
              </InfoRow>
              <InfoRow label='Mã sản phẩm'>
                <code className='text-caption text-ink-muted'>
                  {product.id}
                </code>
              </InfoRow>
            </dl>
          </Panel>

          <Panel title={`Ghi chú (${product.notes.length})`}>
            {product.notes.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>
                Chưa có ghi chú nào.
              </p>
            ) : (
              <ul className='flex flex-col'>
                {product.notes.map((note) => (
                  <li
                    key={note.id}
                    className='flex items-start justify-between gap-3 border-b border-line py-3 first:pt-0 last:border-b-0'
                  >
                    <p className='text-body-sm whitespace-pre-line text-ink'>
                      {note.content}
                    </p>
                    <IconButton
                      label='Xoá ghi chú'
                      variant='ghost'
                      size='sm'
                      disabled={isBusy}
                      onClick={() =>
                        void run(() =>
                          productApi.removeNote(product.id, note.id),
                        )
                      }
                    >
                      <Icon name='trash' className='size-4 text-danger' />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={handleAddNote}
              className='mt-4 flex flex-wrap gap-2'
            >
              <div className='min-w-60 flex-1'>
                <Input
                  size='sm'
                  value={noteContent}
                  onChange={(event) => setNoteContent(event.target.value)}
                  placeholder='Thêm ghi chú, ví dụ: bảo quản ngăn mát'
                  aria-label='Nội dung ghi chú'
                />
              </div>
              <Button
                type='submit'
                variant='outline'
                disabled={isBusy || !noteContent.trim()}
              >
                Thêm ghi chú
              </Button>
            </form>
          </Panel>

          <Panel title={`Ảnh (${product.media.length})`}>
            {product.media.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>
                Chưa có ảnh. Tính năng tải ảnh sẽ có khi backend hỗ trợ.
              </p>
            ) : (
              <ul className='flex flex-col gap-1'>
                {product.media.map((media) => (
                  <li
                    key={media.id}
                    className='truncate text-caption text-ink-muted'
                  >
                    {media.url}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Cột phụ */}
        <div className='flex flex-col gap-6'>
          <Panel title='Tồn kho'>
            <div className='flex flex-wrap items-center gap-3'>
              <p>
                <span className='text-h3 font-semibold text-ink'>{stock}</span>{' '}
                <span className='text-body-sm text-ink-muted'>
                  {product.unit}
                </span>
              </p>
              <StockStatusBadge status={status} />
            </div>
            <ButtonLink
              href={`/vendors/stocks/${product.id}`}
              variant='outline'
              size='sm'
              className='mt-4'
            >
              Quản lý tồn kho
              <Icon name='chevron-right' className='size-4' />
            </ButtonLink>
          </Panel>

          <Panel title={`Tag (${product.tags.length})`}>
            {product.tags.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>Chưa có tag nào.</p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {product.tags.map((tag) => (
                  <RemovableTag
                    key={tag.id}
                    removeLabel={`Xoá tag ${tag.name}`}
                    disabled={isBusy}
                    onRemove={() =>
                      void run(() => productApi.removeTag(product.id, tag.name))
                    }
                  >
                    {tag.name}
                  </RemovableTag>
                ))}
              </div>
            )}
            <form onSubmit={handleAddTag} className='mt-4 flex gap-2'>
              <div className='min-w-0 flex-1'>
                <Input
                  size='sm'
                  value={tagName}
                  onChange={(event) => setTagName(event.target.value)}
                  placeholder='Tên tag'
                  aria-label='Tên tag mới'
                />
              </div>
              <Button
                type='submit'
                variant='outline'
                disabled={isBusy || !tagName.trim()}
              >
                Thêm
              </Button>
            </form>
          </Panel>

          <Panel title={`Bộ sưu tập (${product.collections.length})`}>
            {product.collections.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>
                Chưa thuộc bộ sưu tập nào.
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {product.collections.map((collection) => (
                  <RemovableTag
                    key={collection.id}
                    removeLabel={`Bỏ khỏi bộ sưu tập ${collection.name}`}
                    disabled={isBusy}
                    onRemove={() =>
                      void run(() =>
                        productApi.removeFromCollection(
                          product.id,
                          collection.id,
                        ),
                      )
                    }
                  >
                    {collection.name}
                  </RemovableTag>
                ))}
              </div>
            )}
            {availableCollections.length > 0 && (
              <form
                onSubmit={handleAssignCollection}
                className='mt-4 flex flex-col gap-2'
              >
                <Select
                  aria-label='Chọn bộ sưu tập'
                  value={collectionId}
                  onChange={(event) => setCollectionId(event.target.value)}
                  wrapperClassName='w-full'
                >
                  <option value=''>Chọn bộ sưu tập</option>
                  {availableCollections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
                <Button
                  type='submit'
                  variant='outline'
                  disabled={isBusy || !collectionId}
                >
                  Thêm vào bộ sưu tập
                </Button>
              </form>
            )}
          </Panel>
        </div>
      </div>
    </VendorPage>
  );
};

ProductDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default ProductDetailPage;
