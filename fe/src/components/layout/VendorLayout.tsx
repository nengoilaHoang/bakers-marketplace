import { useRouter } from 'next/router';
import React, { useState } from 'react';
import NavLink from '../ui/NavLink';
import AvatarMenu from '../ui/AvatarMenu';

type SidebarTabProps = Readonly<{
  id: string;
  href: string;
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  innerTabs: Array<{
    id: string;
    href: string;
    label: string;
    isActive: boolean;
  }>;
}>;

const SidebarTab = ({
  id,
  href,
  icon,
  label,
  isActive,
  innerTabs,
}: SidebarTabProps) => {
  const [spread, setSpread] = useState(isActive);
  const submenuId = `${id}-submenu`;

  return (
    <li role='menuitem' id={id} className='group relative'>
      <NavLink
        href={href}
        className={`flex flex-row items-center gap-3 text-sm font-medium px-6 py-2.5 transition-colors ${
          isActive
            ? 'text-zinc-900 font-semibold bg-zinc-400'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 active:bg-zinc-400/60'
        }`}
      >
        <span className='shrink-0 [&>svg]:size-6 [&>svg]:fill-current transition-colors'>
          {icon}
        </span>
        <span>{label}</span>
        {innerTabs.length > 0 && (
          <button
            onClick={() => setSpread((prev) => !prev)}
            aria-expanded={spread}
            aria-controls={submenuId}
            aria-label={`Toggle ${label} sub-items`}
            className={`ml-auto text-zinc-600 hover:text-zinc-900 pointer-events-auto transition-[rotate] [animation-fill-mode:forwards] origin-center ${spread ? 'rotate-0' : 'rotate-180'}`.trim()}
          >
            <span aria-hidden='true'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                viewBox='0 0 16 16'
              >
                <path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z' />
              </svg>
            </span>
          </button>
        )}
      </NavLink>

      {innerTabs.length > 0 && (
        <div
          id={submenuId}
          aria-expanded={spread}
          aria-hidden={!spread}
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isActive && spread ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <ul className='overflow-hidden ml-9 border-l-2 border-zinc-400'>
            {innerTabs.map((t) => (
              <li role='menuitem' id={`${id}-${t.id}`} key={t.id}>
                <NavLink
                  href={t.href}
                  className={`block w-full text-sm pl-6 py-3 ${
                    t.isActive
                      ? 'text-zinc-900 font-semibold bg-zinc-300'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 active:bg-zinc-300/60'
                  }`}
                >
                  <span>{t.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

const NAVIGATION_TABS = [
  {
    id: 'storefronts',
    label: 'Storefront',
    href: '/vendors/storefronts',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 16 16'
        fill='currentColor'
        aria-hidden='true'
      >
        <path d='M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5M4 15h3v-5H4zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zm3 0h-2v3h2z' />
      </svg>
    ),
    innerTabs: [
      {
        id: 'overview',
        label: 'Overview',
        href: '/vendors/storefronts',
      },
    ],
  },
  {
    id: 'products',
    label: 'Product',
    href: '/vendors/products',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        fill='currentColor'
        viewBox='0 0 16 16'
      >
        <path d='M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0' />
        <path d='M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1m0 5.586 7 7L13.586 9l-7-7H2z' />
      </svg>
    ),
  },
];

const VendorLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <div className='grid grid-cols-[280px_1fr] w-screen h-dvh overflow-hidden bg-white'>
      <aside
        id='sidebar'
        aria-label='Vendor Sidebar Navigation'
        className='w-full flex flex-col shrink-0 border-r border-zinc-200 bg-zinc-50/80'
      >
        <div className='flex flex-row gap-3 h-16 shrink-0 justify-start items-center px-6 border-b border-zinc-200 text-zinc-900'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            fill='currentColor'
            className='size-6'
            viewBox='0 0 16 16'
          >
            <path d='M6 1v3H1V1zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm14 12v3h-5v-3zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zM6 8v7H1V8zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm14-6v7h-5V1zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1z' />
          </svg>
          <p className='text-lg font-bold tracking-tight'>VENDOR PLATFORM</p>
        </div>
        <nav className='flex-1 overflow-y-hidden py-4'>
          <ul className='flex flex-col gap-1'>
            {NAVIGATION_TABS.map((tab) => (
              <SidebarTab
                key={tab.id}
                {...tab}
                isActive={pathname.startsWith(tab.href)}
                innerTabs={
                  tab.innerTabs
                    ? [
                        ...tab.innerTabs.map((t) => ({
                          ...t,
                          isActive: pathname.startsWith(t.href),
                        })),
                      ]
                    : []
                }
              />
            ))}
          </ul>
        </nav>
      </aside>
      <div>
        <header
          id='header'
          className='flex flex-row-reverse items-center h-16 border-b border-zinc-200'
        >
          <div className='flex items-center h-full px-6 border-l border-zinc-200'>
            <AvatarMenu actions={[]}></AvatarMenu>
          </div>
        </header>
        <main id='main' className='bg-white'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
