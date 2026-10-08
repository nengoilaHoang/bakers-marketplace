import ProfileHeader from '@/components/mockup/profile/ProfileHeader';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import SiteLayout from '@/components/ui/SiteLayout';

// Mockup: My Profile page (Figma node 1:2029)
export default function MockupProfilePage() {
  return (
    <SiteLayout title='Hồ sơ của tôi' activeHref='/mockup/profile'>
      <ProfileHeader title='Hồ sơ của tôi' active='profile' showBio />

      <Container size='narrow' className='py-12'>
        <form
          onSubmit={(event) => event.preventDefault()}
          className='flex flex-col gap-9 rounded-panel bg-surface px-5 py-6 sm:px-8'
        >
          <div className='grid gap-5 sm:grid-cols-2 lg:pr-60'>
            <Field label='Tên' htmlFor='first-name'>
              <Input id='first-name' defaultValue='June' />
            </Field>
            <Field label='Họ' htmlFor='last-name'>
              <Input id='last-name' defaultValue='Jacob' />
            </Field>
          </div>
          <Field label='Giới thiệu ngắn về bạn' htmlFor='bio'>
            <Textarea id='bio' rows={5} placeholder='Viết đôi dòng về bạn' />
          </Field>
          <div className='grid gap-5 sm:grid-cols-2 lg:pr-44'>
            <Field label='Email' htmlFor='email'>
              <Input id='email' type='email' defaultValue='junejacob67@mail.com' />
            </Field>
            <Field label='Website' htmlFor='website'>
              <Input id='website' type='url' placeholder='Chia sẻ đường dẫn tác phẩm của bạn' />
            </Field>
          </div>
          <Button type='submit' className='min-w-38 self-start'>
            Lưu thay đổi
          </Button>
        </form>
      </Container>
    </SiteLayout>
  );
}
