import Link from 'next/link';
import { useEffect, useState } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import IconButton, { IconLink } from '@/components/ui/IconButton';
import Table, { Td, Th } from '@/components/ui/Table';
import { PanelSkeleton } from '@/components/vendor/Panel';
import VendorPage from '@/components/vendor/VendorPage';
import type { NextPageWithLayout } from '@/pages/_app';
import { collectionApi } from '@/services/collections';
import type { Collection } from '@/types/collection';

const CollectionListPage: NextPageWithLayout = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

      try {
        const response = await collectionApi.getAll(onlyActive);
        if (!ignore) {
          setCollections(response.data);
          setError(null);
        }
      } catch (requestError) {
        if (!ignore) setError((requestError as Error).message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => void load(), 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [onlyActive, attempt]);

  async function handleDelete(collection: Collection) {
    if (!confirm(`Xoá bộ sưu tập "${collection.name}"?`)) return;

    try {
      await collectionApi.remove(collection.id);
      setCollections((current) => current.filter((item) => item.id !== collection.id));
      setNotice({ tone: 'success', text: `Đã xoá "${collection.name}".` });
    } catch (deleteError) {
      setNotice({ tone: 'danger', text: (deleteError as Error).message });
    }
  }

  return (
    <VendorPage
      title='Bộ sưu tập'
      description='Nhóm sản phẩm theo chủ đề để khách dễ tìm.'
      actions={
        <ButtonLink href='/vendors/collections/new' size='sm'>
          <Icon name='plus' className='size-4' />
          Tạo bộ sưu tập
        </ButtonLink>
      }
    >
      <Checkbox
        label='Chỉ hiện bộ sưu tập đang hoạt động'
        checked={onlyActive}
        onChange={(event) => setOnlyActive(event.target.checked)}
      />

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      {loading ? (
        <PanelSkeleton className='h-64' />
      ) : error ? (
        <ErrorState
          title='Không thể tải bộ sưu tập'
          message={error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      ) : collections.length === 0 ? (
        <EmptyState
          icon='hand-platter'
          title={onlyActive ? 'Không có bộ sưu tập nào đang hoạt động' : 'Chưa có bộ sưu tập nào'}
          description='Tạo bộ sưu tập rồi gán sản phẩm vào từ trang chi tiết sản phẩm.'
          action={<ButtonLink href='/vendors/collections/new'>Tạo bộ sưu tập</ButtonLink>}
        />
      ) : (
        <Table caption='Danh sách bộ sưu tập'>
          <thead>
            <tr>
              <Th>Tên</Th>
              <Th>Mô tả</Th>
              <Th>Trạng thái</Th>
              <Th>
                <span className='sr-only'>Thao tác</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className='hover:bg-surface-soft/60'>
                <Td>
                  <Link
                    href={`/vendors/collections/${collection.id}`}
                    className='font-medium text-ink hover:underline'
                  >
                    {collection.name}
                  </Link>
                  <p className='text-caption text-ink-muted'>{collection.slug}</p>
                </Td>
                <Td className='text-ink-muted'>{collection.description || '—'}</Td>
                <Td>
                  <Badge tone={collection.isActive ? 'success' : 'neutral'}>
                    {collection.isActive ? 'Hoạt động' : 'Tắt'}
                  </Badge>
                </Td>
                <Td align='right'>
                  <div className='flex justify-end gap-1'>
                    <IconLink
                      href={`/vendors/collections/${collection.id}/edit`}
                      label={`Sửa ${collection.name}`}
                      variant='ghost'
                      size='sm'
                    >
                      <Icon name='edit' className='size-4' />
                    </IconLink>
                    <IconButton
                      label={`Xoá ${collection.name}`}
                      variant='ghost'
                      size='sm'
                      onClick={() => void handleDelete(collection)}
                    >
                      <Icon name='trash' className='size-4 text-danger' />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </VendorPage>
  );
};

CollectionListPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default CollectionListPage;
