import { useRouter } from 'next/router';
import { useState } from 'react';

import CollectionForm, {
  EMPTY_COLLECTION_FORM,
  toCollectionInput,
  type CollectionFormValues,
} from '@/components/collection/CollectionForm';
import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import VendorPage from '@/components/vendor/VendorPage';
import type { NextPageWithLayout } from '@/pages/_app';
import { collectionApi } from '@/services/collections';

const NewCollectionPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(values: CollectionFormValues) {
    setSaving(true);
    setError(null);

    try {
      const response = await collectionApi.create(toCollectionInput(values));
      await router.push(`/vendors/collections/${response.data.id}`);
    } catch (createError) {
      setError(createError);
      setSaving(false);
    }
  }

  return (
    <VendorPage
      title='Tạo bộ sưu tập'
      breadcrumb={[{ label: 'Bộ sưu tập', href: '/vendors/collections' }, { label: 'Tạo mới' }]}
      size='narrow'
    >
      <CollectionForm
        initialValues={EMPTY_COLLECTION_FORM}
        submitLabel='Tạo bộ sưu tập'
        cancelHref='/vendors/collections'
        saving={saving}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </VendorPage>
  );
};

NewCollectionPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default NewCollectionPage;
