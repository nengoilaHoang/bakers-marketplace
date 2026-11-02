import type { GetServerSideProps } from 'next';

import Feed from '@/components/feed/Feed';
import Landing from '@/components/landing/Landing';
import AppLayout from '@/components/layout/AppLayout';
import PublicLayout from '@/components/layout/PublicLayout';

type HomePageProps = {
  isAuthenticated: boolean;
};

// Cùng quy tắc với proxy.ts: còn refresh token là còn phiên đăng nhập
export const getServerSideProps = (async ({ req }) => {
  return { props: { isAuthenticated: Boolean(req.cookies.refreshToken) } };
}) satisfies GetServerSideProps<HomePageProps>;

export default function HomePage({ isAuthenticated }: HomePageProps) {
  return isAuthenticated ? <Feed /> : <Landing />;
}

HomePage.getLayout = function getLayout(page: React.ReactElement<HomePageProps>) {
  return page.props.isAuthenticated ? (
    <AppLayout>{page}</AppLayout>
  ) : (
    <PublicLayout>{page}</PublicLayout>
  );
};
