import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import AppLayout from '@/components/layout/AppLayout';
import MyPostsTab from '@/components/me/MyPostsTab';
import MyRecipesTab from '@/components/me/MyRecipesTab';
import SavedPostsTab from '@/components/me/SavedPostsTab';

const TABS = [
  { id: 'posts', label: 'Bài viết', Content: MyPostsTab },
  { id: 'recipes', label: 'Công thức', Content: MyRecipesTab },
  { id: 'saved', label: 'Đã lưu', Content: SavedPostsTab },
] as const;

export default function MePage() {
  const router = useRouter();
  const activeTab = TABS.find((tab) => tab.id === router.query.tab) ?? TABS[0];
  const { Content } = activeTab;

  return (
    <>
      <Head>
        <title>Trang của tôi | Bakers Marketplace</title>
      </Head>

      <h1 className='text-3xl font-semibold tracking-tight text-zinc-950'>
        Trang của tôi
      </h1>

      <nav aria-label='Nội dung của tôi' className='mt-6 mb-8 flex gap-1 border-b border-zinc-200'>
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={{ pathname: '/me', query: { tab: tab.id } }}
            aria-current={tab.id === activeTab.id ? 'page' : undefined}
            className='-mb-px border-b-2 border-transparent px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 aria-[current=page]:border-zinc-950 aria-[current=page]:text-zinc-950'
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {router.isReady && <Content />}
    </>
  );
}

MePage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
