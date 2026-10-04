import Head from 'next/head';

import { BRAND } from '@/lib/brand';

type PageTitleProps = Readonly<{
  title: string;
  description?: string;
}>;

// Đặt <title> theo mẫu "Tên trang · Bakers Marketplace" (cho trang dùng layout cố định).
export default function PageTitle({ title, description }: PageTitleProps) {
  return (
    <Head>
      <title>{`${title} · ${BRAND.name}`}</title>
      {description && <meta name='description' content={description} />}
    </Head>
  );
}
