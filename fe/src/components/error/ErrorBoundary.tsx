// components/ui/ErrorBoundary.tsx
import Link from 'next/link';
import React from 'react';
import Button from '../ui/Button';
import Container from '../ui/Container';
import Icon from '../ui/Icon';
import ErrorShell from './ErrorShell';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught client runtime error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorShell title='Lỗi ứng dụng'>
          <Container
            size='narrow'
            className='flex flex-col items-center justify-center py-16 text-center'
          >
            <div className='flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger'>
              <Icon name='circle-alert' className='size-8' />
            </div>

            <h1 className='mt-6 font-heading text-h2 font-semibold text-ink'>
              Đã xảy ra sự cố giao diện
            </h1>

            <p className='mt-2 max-w-md text-body text-ink-muted'>
              {this.state.error?.message ||
                'Một lỗi không mong muốn đã xảy ra trên trình duyệt của bạn.'}
            </p>

            <div className='mt-6 flex flex-wrap gap-3 justify-center'>
              <Button
                variant='primary'
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                <Icon name='refresh' className='size-4' />
                Thử lại
              </Button>
              <Link
                href='/'
                className='inline-flex items-center justify-center rounded-full border border-ink px-5 text-body text-ink hover:bg-ink/5'
              >
                Về an toàn
              </Link>
            </div>
          </Container>
        </ErrorShell>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
