import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import ProductForm, {
  EMPTY_PRODUCT_FORM,
  type ProductFormValues,
} from '@/components/product/ProductForm';
import VendorPage from '@/components/vendor/VendorPage';
import useVendorContext from '@/hooks/storefront/useVendorContext';
import useAuth from '@/hooks/user/useAuthContext';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Storefront } from '@/types/storefront';

const NewProductPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { account } = useAuth();
  const { storefronts } = useVendorContext();

  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  // Thương hiệu của vendor lấy từ các storefront (mỗi storefront thuộc một thương hiệu).
  // API storefront hiện chỉ trả brandId (chưa có tên), nên tạm hiện "Thương hiệu 1, 2…".
  const brands = useMemo(() => {
    const ids = storefronts
      .map(
        (storefront) =>
          (storefront as Storefront & { brandId?: string }).brandId ??
          storefront.brand?.id,
      )
      .filter((brandId): brandId is string => Boolean(brandId));

    return [...new Set(ids)].map((brandId, index) => ({
      id: brandId,
      name: `Thương hiệu ${index + 1} (${brandId.slice(0, 8)})`,
    }));
  }, [storefronts]);

  async function handleSubmit(values: ProductFormValues) {
    setSaving(true);
    setError(null);

    try {
      const response = await productApi.create({
        brandId: values.brandId,
        vendorId: account?.id ?? null,
        title: values.title,
        description: values.description || null,
        slug: values.slug,
        unitPrice: Number(values.unitPrice),
        unitCost: Number(values.unitCost),
        unit: values.unit,
        expirationDate: values.expirationDate || null,
      });

      await router.push(`/vendors/products/${response.data.id}`);
    } catch (createError) {
      setError(createError);
      setSaving(false);
    }
  }

  return (
    <VendorPage
      title='Tạo sản phẩm'
      breadcrumb={[
        { label: 'Sản phẩm', href: '/vendors/products' },
        { label: 'Tạo mới' },
      ]}
      size='narrow'
    >
      <ProductForm
        // Tạo lại form khi danh sách thương hiệu tải xong để chọn sẵn khi chỉ có một thương hiệu.
        key={brands.map((brand) => brand.id).join()}
        initialValues={{
          ...EMPTY_PRODUCT_FORM,
          brandId: brands.length === 1 ? brands[0].id : '',
        }}
        brands={brands}
        autoSlug
        submitLabel='Tạo sản phẩm'
        cancelHref='/vendors/products'
        saving={saving}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </VendorPage>
  );
};

NewProductPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default NewProductPage;
