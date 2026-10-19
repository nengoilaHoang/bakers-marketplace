import Feed from '@/components/feed/Feed';
import Landing from '@/components/landing/Landing';
import AppLayout from '@/components/layout/AppLayout';

type HomePageProps = {
  isAuthenticated: boolean;
};

export default function HomePage({ isAuthenticated }: HomePageProps) {
  return isAuthenticated ? <Feed /> : <Landing />;
}

HomePage.getLayout = function getLayout(
  page: React.ReactElement<HomePageProps>,
) {
  return <AppLayout>{page}</AppLayout>;
};
