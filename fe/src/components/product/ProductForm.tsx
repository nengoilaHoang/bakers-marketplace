import { useState, type FormEvent } from 'react';

import Button, { ButtonLink } from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ApiErrorAlert from '@/components/vendor/ApiErrorAlert';
import Panel from '@/components/vendor/Panel';

export type ProductFormValues = {
  brandId: string;
  title: string;
  slug: string;
  description: string;
  unitPrice: string;
  unitCost: string;
  unit: string;
  expirationDate: string;
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  brandId: '',
  title: '',
  slug: '',
  description: '',
  unitPrice: '',
  unitCost: '',
  unit: '',
  expirationDate: '',
};

type ProductFormProps = Readonly<{
  initialValues: ProductFormValues;
  // Danh sách thương hiệu để chọn khi tạo mới; bỏ trống (null) thì ẩn ô thương hiệu (trang sửa).
  brands: { id: string; name: string }[] | null;
  submitLabel: string;
  cancelHref: string;
  saving: boolean;
  error: unknown;
  // Khi tạo mới, slug tự sinh theo tên cho tới khi người dùng tự sửa slug.
  autoSlug?: boolean;
  onSubmit: (values: ProductFormValues) => void;
}>;

// "Bánh Trung Thu Thập Cẩm" → "banh-trung-thu-thap-cam"
function toSlug(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Form tạo / sửa sản phẩm của vendor.
export default function ProductForm({
  initialValues,
  brands,
  submitLabel,
  cancelHref,
  saving,
  error,
  autoSlug = false,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState(initialValues);
  const [slugEdited, setSlugEdited] = useState(!autoSlug);

  function update(key: keyof ProductFormValues, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === 'title' && !slugEdited) next.slug = toSlug(value);
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <Panel title='Thông tin chung'>
        <div className='flex flex-col gap-5'>
          {brands && (
            <Field label='Thương hiệu' htmlFor='product-brand' required>
              {brands.length > 0 ? (
                <Select
                  id='product-brand'
                  required
                  value={values.brandId}
                  onChange={(event) => update('brandId', event.target.value)}
                  wrapperClassName='w-full sm:w-80'
                >
                  <option value=''>Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id='product-brand'
                  required
                  value={values.brandId}
                  onChange={(event) => update('brandId', event.target.value)}
                  placeholder='Mã thương hiệu (brand ID)'
                />
              )}
            </Field>
          )}

          <Field label='Tên sản phẩm' htmlFor='product-title' required>
            <Input
              id='product-title'
              required
              value={values.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder='Ví dụ: Bánh trung thu thập cẩm'
            />
          </Field>

          <Field
            label='Slug'
            htmlFor='product-slug'
            required
            hint='Dùng trong đường dẫn, chỉ gồm chữ thường, số và dấu gạch ngang.'
          >
            <Input
              id='product-slug'
              required
              value={values.slug}
              onChange={(event) => {
                setSlugEdited(true);
                update('slug', event.target.value);
              }}
              placeholder='banh-trung-thu-thap-cam'
            />
          </Field>

          <Field label='Mô tả' htmlFor='product-description'>
            <Textarea
              id='product-description'
              rows={4}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder='Nguyên liệu, hương vị, cách bảo quản…'
            />
          </Field>
        </div>
      </Panel>

      <Panel title='Giá và đơn vị'>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label='Giá bán' htmlFor='product-price' required>
            <Input
              id='product-price'
              type='number'
              min={0}
              required
              value={values.unitPrice}
              onChange={(event) => update('unitPrice', event.target.value)}
            />
          </Field>
          <Field label='Giá vốn' htmlFor='product-cost' required hint='Không lớn hơn giá bán.'>
            <Input
              id='product-cost'
              type='number'
              min={0}
              required
              value={values.unitCost}
              onChange={(event) => update('unitCost', event.target.value)}
            />
          </Field>
          <Field label='Đơn vị' htmlFor='product-unit' required hint='Cái, hộp, ổ, kg…'>
            <Input
              id='product-unit'
              required
              value={values.unit}
              onChange={(event) => update('unit', event.target.value)}
            />
          </Field>
          <Field label='Hạn sử dụng' htmlFor='product-expiration'>
            <Input
              id='product-expiration'
              type='date'
              value={values.expirationDate}
              onChange={(event) => update('expirationDate', event.target.value)}
            />
          </Field>
        </div>
      </Panel>

      {error != null && <ApiErrorAlert error={error} />}

      <div className='flex flex-wrap gap-3'>
        <Button type='submit' disabled={saving}>
          {saving ? 'Đang lưu…' : submitLabel}
        </Button>
        <ButtonLink href={cancelHref} variant='outline'>
          Huỷ
        </ButtonLink>
      </div>
    </form>
  );
}
