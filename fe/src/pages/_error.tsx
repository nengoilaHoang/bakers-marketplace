// pages/_error.tsx
import ErrorShell from '@/components/error/ErrorShell';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { NextPageContext } from 'next';

type ErrorPageProps = {
  statusCode: number;
};

const ErrorPage = ({ statusCode }: ErrorPageProps) => {
  const is404 = statusCode === 404;

  return (
    <ErrorShell title={is404 ? 'Không tìm thấy trang' : 'Đã có lỗi xảy ra'}>
      <Container
        size='narrow'
        className='flex flex-col items-center justify-center py-16 text-center'
      >
        <div className='flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger'>
          <Icon name='circle-alert' className='size-8' />
        </div>

        <h1 className='mt-6 font-heading text-h2 font-semibold text-ink'>
          {statusCode ? `Lỗi ${statusCode}` : 'Lỗi hệ thống'}
        </h1>

        <p className='mt-2 max-w-md text-body text-ink-muted'>
          {is404
            ? 'Nội dung bạn đang cố truy cập không tồn tại hoặc đã bị di chuyển.'
            : 'Hệ thống đang gặp sự cố trong quá trình xử lý yêu cầu. Vui lòng thử lại sau.'}
        </p>

        <div className='mt-8 flex flex-wrap justify-center gap-3'>
          <Button variant='primary' onClick={() => window.location.reload()}>
            <Icon name='refresh' className='size-4' />
            Tải lại trang
          </Button>
          <ButtonLink href='/' variant='outline'>
            Về trang chủ
          </ButtonLink>
        </div>
      </Container>
    </ErrorShell>
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  let statusCode = 404;
  if (res) statusCode = res.statusCode;
  else if (err?.statusCode) statusCode = err.statusCode;
  return { statusCode };
};

export default ErrorPage;
