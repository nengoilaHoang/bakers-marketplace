import { useState, type FormEvent } from 'react';

import Button, { ButtonLink } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import ApiErrorAlert from '@/components/vendor/ApiErrorAlert';
import Panel from '@/components/vendor/Panel';
import type { CollectionInput } from '@/types/collection';

export type CollectionFormValues = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
};

export const EMPTY_COLLECTION_FORM: CollectionFormValues = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
};

export function toCollectionInput(values: CollectionFormValues): CollectionInput {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    isActive: values.isActive,
  };
}

type CollectionFormProps = Readonly<{
  initialValues: CollectionFormValues;
  submitLabel: string;
  cancelHref: string;
  saving: boolean;
  error: unknown;
  onSubmit: (values: CollectionFormValues) => void;
}>;

// Form tạo / sửa bộ sưu tập sản phẩm.
export default function CollectionForm({
  initialValues,
  submitLabel,
  cancelHref,
  saving,
  error,
  onSubmit,
}: CollectionFormProps) {
  const [values, setValues] = useState(initialValues);

  function update<K extends keyof CollectionFormValues>(key: K, value: CollectionFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <Panel title='Thông tin bộ sưu tập'>
        <div className='flex flex-col gap-5'>
          <Field label='Tên bộ sưu tập' htmlFor='collection-name' required>
            <Input
              id='collection-name'
              required
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder='Ví dụ: Hàng mới về'
            />
          </Field>
          <Field
            label='Slug'
            htmlFor='collection-slug'
            required
            hint='Dùng trong đường dẫn, chỉ gồm chữ thường, số và dấu gạch ngang.'
          >
            <Input
              id='collection-slug'
              required
              value={values.slug}
              onChange={(event) => update('slug', event.target.value)}
              placeholder='hang-moi-ve'
            />
          </Field>
          <Field label='Mô tả' htmlFor='collection-description'>
            <Textarea
              id='collection-description'
              rows={3}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </Field>
          <Checkbox
            label='Đang hoạt động (hiển thị cho khách)'
            checked={values.isActive}
            onChange={(event) => update('isActive', event.target.checked)}
          />
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
