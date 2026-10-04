import { useRouter } from 'next/router';

import AppLayout from '@/components/layout/AppLayout';
import MeHeader from '@/components/me/MeHeader';
import MyPostsTab from '@/components/me/MyPostsTab';
import MyRecipesTab from '@/components/me/MyRecipesTab';
import SavedPostsTab from '@/components/me/SavedPostsTab';
import Container from '@/components/ui/Container';
import PageTitle from '@/components/ui/PageTitle';
import { useSessionUser } from '@/hooks/useSessionUser';

const TABS = [
  { id: 'posts', title: 'Bài viết của tôi', Content: MyPostsTab },
  { id: 'recipes', title: 'Công thức của tôi', Content: MyRecipesTab },
  { id: 'saved', title: 'Bài viết đã lưu', Content: SavedPostsTab },
] as const;

export default function MePage() {
  const router = useRouter();
  const account = useSessionUser();
  const activeTab = TABS.find((tab) => tab.id === router.query.tab) ?? TABS[0];
  const { Content } = activeTab;

  return (
    <>
      <PageTitle title={activeTab.title} />
      <MeHeader title='Trang của tôi' active={activeTab.id} account={account} />

      <Container size='narrow' className='py-12'>
        <h2 className='text-h3 text-ink'>{activeTab.title}</h2>
        <div className='mt-6'>{router.isReady && <Content />}</div>
      </Container>
    </>
  );
}

MePage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
