import React from 'react';
import CanvasTopBar from '../storefront/canvas/CanvasTopBar';
import StorefrontCanvasProvider from '@/hooks/storefront/StorefrontCanvasProvider';

type StorefrontEditLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const StorefrontEditLayout = ({ children }: StorefrontEditLayoutProps) => {
  return (
    <StorefrontCanvasProvider
      initialBreakpoint={'desktop'}
      initialZoom={1}
      initialIsPreview={false}
    >
      <div className='flex flex-col relative h-screen w-screen overflow-hidden'>
        <CanvasTopBar></CanvasTopBar>
        <div className='relative flex flex-col flex-1 min-h-0 overflow-y-auto'>
          <main className='size-full flex-1 flex flex-col min-w-0 min-h-0 z-0'>
            {children}
          </main>
          <aside className='absolute right-full top-0 bottom-0 z-10'></aside>
        </div>
      </div>
    </StorefrontCanvasProvider>
  );
};

export default StorefrontEditLayout;
