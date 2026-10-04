import IngredientRows from '@/components/mockup/recipe-form/IngredientRows';
import StepRows from '@/components/mockup/recipe-form/StepRows';
import UploadTile from '@/components/mockup/recipe-form/UploadTile';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import SiteLayout from '@/components/ui/SiteLayout';

function TimeField({ id, label }: { id: string; label: string }) {
  return (
    <div role='group' aria-labelledby={`${id}-label`} className='flex flex-wrap items-center gap-3'>
      <span id={`${id}-label`} className='text-lead font-medium text-ink'>
        {label}
        <span aria-hidden className='ml-1 font-semibold text-danger'>
          *
        </span>
      </span>
      <div className='w-22'>
        <Input aria-label={`${label} (giờ)`} tone='accent' size='sm' type='number' min={0} placeholder='Giờ' />
      </div>
      <div className='w-22'>
        <Input aria-label={`${label} (phút)`} tone='accent' size='sm' type='number' min={0} max={59} placeholder='Phút' />
      </div>
    </div>
  );
}

// Mockup: +Add Recipes page (Figma node 1:1935)
export default function MockupAddRecipePage() {
  return (
    <SiteLayout title='Thêm công thức'>
      <Container size='narrow' className='pt-14 pb-20'>
        <h1 className='font-heading text-h2 font-bold text-ink [font-variant-caps:small-caps]'>
          Thêm công thức của bạn
        </h1>

        <form
          onSubmit={(event) => event.preventDefault()}
          className='mt-5 flex flex-col gap-10 overflow-hidden rounded-control bg-page pt-8 pb-12 shadow-raised'
        >
          <div className='flex flex-col gap-8 px-5 sm:px-9'>
            <Field label='Tên công thức' htmlFor='recipe-name' required>
              <Input id='recipe-name' size='lg' placeholder='Nhập tên công thức' />
            </Field>
            <Field label='Giới thiệu ngắn' htmlFor='recipe-intro' required>
              <Textarea id='recipe-intro' rows={4} placeholder='Giới thiệu đôi nét về công thức của bạn!' />
            </Field>
          </div>

          <div className='flex flex-col items-center gap-5 bg-surface px-5 py-7 shadow-soft'>
            <Field label='Khẩu phần' htmlFor='servings' required inline>
              <div className='w-60'>
                <Input id='servings' tone='accent' size='sm' type='number' min={1} placeholder='Số người ăn' />
              </div>
            </Field>
            <div className='flex flex-wrap justify-center gap-x-10 gap-y-4'>
              <TimeField id='prep' label='Chuẩn bị' />
              <TimeField id='cook' label='Nấu' />
            </div>
          </div>

          <div className='flex flex-col gap-10 px-5 sm:px-12'>
            <Field label='Nguyên liệu' required hint='Thêm các nguyên liệu cần dùng'>
              <IngredientRows />
            </Field>
            <Field label='Các bước' required hint='Hướng dẫn từng bước thực hiện'>
              <StepRows />
            </Field>

            <hr className='h-1.5 rounded-full border-0 bg-line' />

            <Field label='Mẹo nấu ăn' htmlFor='recipe-tips' required>
              <Textarea id='recipe-tips' rows={4} placeholder='Mẹo nhỏ giúp người đọc nấu dễ hơn!' />
            </Field>
            <Field label='Thư viện ảnh' required>
              <div className='grid gap-7 sm:grid-cols-3'>
                <UploadTile id='upload-1' />
                <UploadTile id='upload-2' />
                <UploadTile id='upload-3' />
              </div>
            </Field>

            <div className='mt-6 flex flex-wrap gap-4'>
              <Button type='submit' className='min-w-38'>
                Gửi
              </Button>
              <ButtonLink href='/mockup/home' variant='outline'>
                Huỷ
              </ButtonLink>
            </div>
          </div>
        </form>
      </Container>
    </SiteLayout>
  );
}
