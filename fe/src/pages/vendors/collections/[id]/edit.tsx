import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import CollectionForm, {
  toCollectionInput,
  type CollectionFormValues,
} from '@/components/collection/CollectionForm';
import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import { ErrorState } from '@/components/ui/ErrorState';
import { PanelSkeleton } from '@/components/vendor/Panel';
import VendorPage from '@/components/vendor/VendorPage';
import type { NextPageWithLayout } from '@/pages/_app';
import { collectionApi } from '@/services/collections';

const EditCollectionPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [initialValues, setInitialValues] = useState<CollectionFormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    collectionApi
      .getById(id)
      .then(({ data: collection }) => {
        if (ignore) return;
        setInitialValues({
          name: collection.name,
          slug: collection.slug,
          description: collection.description ?? '',
          isActive: collection.isActive,
        });
        setLoadError(null);
      })
      .catch((requestError) => {
        if (!ignore) setLoadError((requestError as Error).message);
      });

    return () => {
      ignore = true;
    };
  }, [id, attempt]);

  async function handleSubmit(values: CollectionFormValues) {
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      await collectionApi.update(id, toCollectionInput(values));
      await router.push(`/vendors/collections/${id}`);
    } catch (updateError) {
      setError(updateError);
      setSaving(false);
    }
  }

  return (
    <VendorPage
      title='Sửa bộ sưu tập'
      breadcrumb={[
        { label: 'Bộ sưu tập', href: '/vendors/collections' },
        {
          label: initialValues?.name || 'Chi tiết',
          href: id ? `/vendors/collections/${id}` : undefined,
        },
        { label: 'Sửa' },
      ]}
      size='narrow'
    >
      {loadError ? (
        <ErrorState
          title='Không thể tải bộ sưu tập'
          message={loadError}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      ) : !initialValues ? (
        <PanelSkeleton className='h-80' />
      ) : (
        <CollectionForm
          initialValues={initialValues}
          submitLabel='Lưu thay đổi'
          cancelHref={`/vendors/collections/${id}`}
          saving={saving}
          error={error}
          onSubmit={(values) => void handleSubmit(values)}
        />
      )}
    </VendorPage>
  );
};

EditCollectionPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default EditCollectionPage;
