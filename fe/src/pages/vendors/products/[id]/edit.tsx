import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import ProductForm, {
  EMPTY_PRODUCT_FORM,
  type ProductFormValues,
} from '@/components/product/ProductForm';
import { ErrorState } from '@/components/ui/ErrorState';
import { PanelSkeleton } from '@/components/vendor/Panel';
import VendorPage from '@/components/vendor/VendorPage';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';

const EditProductPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(
    null,
  );
  const [title, setTitle] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    productApi
      .getById(id)
      .then(({ data: product }) => {
        if (ignore) return;
        setTitle(product.title);
        setInitialValues({
          ...EMPTY_PRODUCT_FORM,
          title: product.title,
          slug: product.slug,
          description: product.description ?? '',
          unitPrice: String(product.unitPrice),
          unitCost: String(product.unitCost),
          unit: product.unit,
          expirationDate: product.expirationDate?.slice(0, 10) ?? '',
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

  async function handleSubmit(values: ProductFormValues) {
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      await productApi.update(id, {
        title: values.title,
        description: values.description || null,
        slug: values.slug,
        unitPrice: Number(values.unitPrice),
        unitCost: Number(values.unitCost),
        unit: values.unit,
        expirationDate: values.expirationDate || null,
      });

      await router.push(`/vendors/products/${id}`);
    } catch (updateError) {
      setError(updateError);
      setSaving(false);
    }
  }

  return (
    <VendorPage
      title='Sửa sản phẩm'
      breadcrumb={[
        { label: 'Sản phẩm', href: '/vendors/products' },
        {
          label: title || 'Chi tiết',
          href: id ? `/vendors/products/${id}` : undefined,
        },
        { label: 'Sửa' },
      ]}
      size='narrow'
    >
      {loadError ? (
        <ErrorState
          title='Không thể tải sản phẩm'
          message={loadError}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      ) : !initialValues ? (
        <PanelSkeleton className='h-96' />
      ) : (
        <ProductForm
          initialValues={initialValues}
          brands={null}
          submitLabel='Lưu thay đổi'
          cancelHref={`/vendors/products/${id}`}
          saving={saving}
          error={error}
          onSubmit={(values) => void handleSubmit(values)}
        />
      )}
    </VendorPage>
  );
};

EditProductPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default EditProductPage;
