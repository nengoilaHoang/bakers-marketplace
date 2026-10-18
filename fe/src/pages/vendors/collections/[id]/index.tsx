import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import ProductTable from '@/components/product/ProductTable';
import Badge from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Panel, { PanelSkeleton } from '@/components/vendor/Panel';
import VendorPage from '@/components/vendor/VendorPage';
import type { NextPageWithLayout } from '@/pages/_app';
import { collectionApi } from '@/services/collections';
import type { Collection } from '@/types/collection';
import { formatDate } from '@/utils/format';

const CollectionDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    collectionApi
      .getById(id)
      .then(({ data }) => {
        if (ignore) return;
        setCollection(data);
        setLoadError(null);
      })
      .catch((requestError) => {
        if (!ignore) setLoadError((requestError as Error).message);
      });

    return () => {
      ignore = true;
    };
  }, [id, attempt]);

  const breadcrumb = [
    { label: 'Bộ sưu tập', href: '/vendors/collections' },
    { label: collection?.name ?? 'Chi tiết' },
  ];

  if (loadError) {
    return (
      <VendorPage title='Bộ sưu tập' breadcrumb={breadcrumb}>
        <ErrorState
          title='Không thể tải bộ sưu tập'
          message={loadError}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      </VendorPage>
    );
  }

  if (!collection) {
    return (
      <VendorPage title='Bộ sưu tập' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-32' />
        <PanelSkeleton className='h-64' />
      </VendorPage>
    );
  }

  const products = collection.products ?? [];

  return (
    <VendorPage
      title={collection.name}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          {collection.name}
          <Badge tone={collection.isActive ? 'success' : 'neutral'}>
            {collection.isActive ? 'Hoạt động' : 'Tắt'}
          </Badge>
        </span>
      }
      description={collection.description || undefined}
      breadcrumb={breadcrumb}
      actions={
        <ButtonLink
          href={`/vendors/collections/${collection.id}/edit`}
          size='sm'
        >
          <Icon name='edit' className='size-4' />
          Sửa bộ sưu tập
        </ButtonLink>
      }
    >
      <Panel>
        <dl className='grid gap-4 text-body-sm sm:grid-cols-3'>
          <div>
            <dt className='text-ink-muted'>Slug</dt>
            <dd className='text-ink'>{collection.slug}</dd>
          </div>
          <div>
            <dt className='text-ink-muted'>Số sản phẩm</dt>
            <dd className='text-ink'>{products.length}</dd>
          </div>
          <div>
            <dt className='text-ink-muted'>Ngày tạo</dt>
            <dd className='text-ink'>
              {formatDate(collection.createdAt) ?? '—'}
            </dd>
          </div>
        </dl>
      </Panel>

      <section className='flex flex-col gap-4'>
        <h2 className='text-h4 font-semibold text-ink'>
          Sản phẩm ({products.length})
        </h2>
        {products.length === 0 ? (
          <EmptyState
            icon='cart'
            title='Chưa có sản phẩm nào'
            description='Mở trang chi tiết của một sản phẩm và thêm sản phẩm vào bộ sưu tập này.'
            action={
              <ButtonLink href='/vendors/products' variant='outline'>
                Đến danh sách sản phẩm
              </ButtonLink>
            }
          />
        ) : (
          <ProductTable products={products} />
        )}
      </section>
    </VendorPage>
  );
};

CollectionDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default CollectionDetailPage;
