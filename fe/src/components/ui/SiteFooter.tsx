import Link from 'next/link';

import { BRAND } from '@/lib/brand';

import Icon from './Icon';
import Logo from './Logo';

const EXPLORE_LINKS = [
  { label: 'Diễn đàn', href: '/' },
  { label: 'Công thức', href: '/recipes' },
  { label: 'Tìm theo nguyên liệu', href: '/recipes/search' },
];

const ACCOUNT_LINKS = [
  { label: 'Trang của tôi', href: '/me' },
  { label: 'Bài viết đã lưu', href: '/me?tab=saved' },
  { label: 'Cài đặt', href: '/settings' },
];

function FooterLinks({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className='text-lead font-semibold uppercase'>
        {title}
      </h2>
      <ul className='mt-4 flex flex-col gap-1.5'>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className='text-caption hover:underline'>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function SiteFooter() {
  return (
    <footer className='bg-primary-deep text-on-primary'>
      <div className='mx-auto max-w-page px-4 pt-8 pb-4 sm:px-6'>
        <div className='grid gap-10 md:grid-cols-[2fr_1fr_1fr] lg:gap-8'>
          <section aria-label='Giới thiệu'>
            <Logo tone='inverse' />
            <p className='mt-4 max-w-sm text-body-sm font-light'>{BRAND.tagline}</p>
          </section>
          <FooterLinks id='footer-explore' title='Khám phá' links={EXPLORE_LINKS} />
          <FooterLinks id='footer-account' title='Tài khoản' links={ACCOUNT_LINKS} />
        </div>

        <div className='mt-12 flex items-center justify-center gap-1 border-t border-on-primary/40 pt-4 text-caption'>
          <Icon name='copyright' className='size-3.5' />
          <span>
            {new Date().getFullYear()} {BRAND.name}. Bảo lưu mọi quyền.
          </span>
        </div>
      </div>
    </footer>
  );
}
