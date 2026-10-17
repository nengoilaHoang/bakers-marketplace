import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Icon, { IconName } from '../ui/Icon';
import SiteLayout from '../ui/SiteLayout';
import VendorSiteHeader from '../vendor/VendorSiteHeader';

type SidebarTabProps = Readonly<{
  href: string;
  icon: IconName;
  label: string;
  isActive: boolean;
  inners?: Array<{
    href: string;
    label: string;
    isActive: boolean;
  }>;
}>;

const SidebarTab = ({
  href,
  icon,
  label,
  isActive,
  inners = [],
}: SidebarTabProps) => {
  const [spread, setSpread] = useState(isActive);
  const submenuId = `${label.toLowerCase().replace(/\s+/g, '-')}-submenu`;
  const hasInners = inners.length > 0;

  // Keep accordion open if current route matches
  useEffect(() => {
    if (isActive) {
      queueMicrotask(() => setSpread(true));
    }
  }, [isActive]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSpread((prev) => !prev);
  };

  return (
    <li onClick={handleToggle} className='relative block'>
      <div
        id={submenuId}
        className={`flex flex-row items-center justify-between text-body-sm transition-colors rounded-control mx-2 ${
          isActive
            ? 'bg-secondary-soft text-ink font-semibold'
            : 'text-ink-muted hover:text-ink hover:bg-surface-soft'
        }`}
      >
        <Link
          href={href}
          aria-current={isActive ? 'page' : undefined}
          className='flex flex-row items-center gap-3 flex-1 px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-control'
        >
          <span className='shrink-0 transition-colors'>
            <Icon name={icon} className='size-5' />
          </span>
          <span>{label}</span>
        </Link>

        {hasInners && (
          <button
            type='button'
            aria-expanded={spread}
            aria-controls={submenuId}
            aria-label={`Toggle ${label} sub-items`}
            className={`p-2 mr-1 text-ink-muted hover:text-ink transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-control ${
              spread ? 'rotate-0' : '-rotate-90'
            }`}
          >
            <Icon name='chevron-down' className='size-4' />
          </button>
        )}
      </div>

      {hasInners && (
        <div
          aria-hidden={!spread}
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            spread ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <ul className='overflow-hidden ml-8 mr-2 mt-1 space-y-0.5 border-l-2 border-line'>
            {inners.map((subItem) => (
              <li className='relative block' key={subItem.href}>
                <Link
                  href={subItem.href}
                  aria-current={subItem.isActive ? 'page' : undefined}
                  className={`block w-full text-body-sm pl-4 py-2 transition-colors rounded-r-control ${
                    subItem.isActive
                      ? 'text-ink font-semibold bg-surface-soft'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-soft'
                  }`}
                >
                  <span>{subItem.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

const VENDOR_NAV: Array<{
  label: string;
  href: string;
  icon: IconName;
  inners?: Array<{ label: string; href: string; icon?: IconName }>;
}> = [
  { label: 'Sản phẩm', href: '/vendors/products', icon: 'cart' },
  { label: 'Tồn kho', href: '/vendors/stocks', icon: 'summary' },
  { label: 'Bộ sưu tập', href: '/vendors/collections', icon: 'hand-platter' },
  {
    label: 'Storefront',
    href: '/vendors/storefronts',
    icon: 'smartphone',
    inners: [
      {
        label: 'Overview',
        href: '/vendors/storefronts',
      },
    ],
  },
  { label: 'Cài đặt', href: '/settings', icon: 'edit' },
];

const VendorLayout = ({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title?: string;
}>) => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <SiteLayout
      theme='vendor'
      title={title}
      header={<VendorSiteHeader />}
      hideFooter={true}
    >
      <div className='flex flex-1 flex-row min-h-0 w-full'>
        {/* Sidebar */}
        <aside
          id='sidebar'
          aria-label='Vendor Sidebar Navigation'
          className='flex w-65 min-h-0 max-h-full flex-col shrink-0 border-r border-line bg-surface'
        >
          <nav className='flex-1 overflow-y-auto py-4'>
            <ul className='flex flex-col gap-1'>
              {VENDOR_NAV.map((tab) => (
                <SidebarTab
                  key={tab.label}
                  href={tab.href}
                  icon={tab.icon}
                  label={tab.label}
                  isActive={pathname.startsWith(tab.href)}
                  inners={tab.inners?.map((sub) => ({
                    ...sub,
                    isActive: pathname === sub.href,
                  }))}
                />
              ))}
            </ul>
          </nav>
        </aside>

        <div className='flex-1 overflow-y-auto min-h-0'>{children}</div>
      </div>
      {/* <div
        data-theme='vendor'
        className='flex flex-col w-screen h-dvh overflow-hidden bg-page text-ink antialiased'
      ></div> */}
    </SiteLayout>
  );
};

export default VendorLayout;
