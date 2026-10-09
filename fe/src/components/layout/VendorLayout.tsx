import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import ReleaseSelect from '../storefront/ReleaseSelect';
import AccountMenu from '../ui/AccountMenu';
import Icon, { IconName } from '../ui/Icon';
import Logo from '../ui/Logo';
import NavLink from '../ui/NavLink';

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
        className={`flex flex-row items-center justify-between text-sm transition-colors rounded-control mx-2 ${
          isActive
            ? 'bg-secondary-soft text-ink font-semibold'
            : 'text-ink-muted hover:text-ink hover:bg-surface-soft'
        }`}
      >
        <NavLink
          href={href}
          className='flex flex-row items-center gap-3 flex-1 px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-control'
        >
          <span className='shrink-0 transition-colors'>
            <Icon name={icon} className='size-5' />
          </span>
          <span>{label}</span>
        </NavLink>

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
                <NavLink
                  href={subItem.href}
                  className={`block w-full text-sm pl-4 py-2 transition-colors rounded-r-control ${
                    subItem.isActive
                      ? 'text-ink font-semibold bg-surface-soft'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-soft'
                  }`}
                >
                  <span>{subItem.label}</span>
                </NavLink>
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
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const { pathname } = router;
  const isStorefront = pathname.startsWith('/vendors/storefronts');

  return (
    <div
      data-theme='vendor'
      className='grid grid-cols-[260px_1fr] w-screen h-dvh overflow-hidden bg-page text-ink antialiased'
    >
      {/* Sidebar */}
      <aside
        id='sidebar'
        aria-label='Vendor Sidebar Navigation'
        className='flex flex-col shrink-0 border-r border-line bg-surface'
      >
        <div className='flex flex-row gap-3 h-16 shrink-0 items-center px-6 border-b border-line'>
          <Logo size='sm' />
        </div>
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

      {/* Main Content Area */}
      <div className='flex flex-col h-full min-h-0 overflow-hidden bg-page'>
        <header
          id='header'
          className='flex flex-row-reverse items-center h-16 border-b border-line bg-surface'
        >
          <div className='flex items-center h-full px-6 border-l border-line'>
            <AccountMenu />
          </div>

          <div className='flex items-center me-3.5'>
            {isStorefront && <ReleaseSelect />}
          </div>
        </header>

        <main id='main' className='flex-1 overflow-y-auto min-h-0 bg-page'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
