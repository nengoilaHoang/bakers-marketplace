import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { useOptionalStorefrontLayoutContext } from '@/hooks/storefront/useStorefrontLayoutContext';
import useVendorStorefrontContext from '@/hooks/storefront/useVendorStorefrontContext';
import { toastStore } from '@/hooks/toastStore';
import { useDropdown } from '@/hooks/useDropdown';
import { createStorefrontReleasePage } from '@/services/storefront';
import { BREAKPOINT_PRESETS, DeviceBreakpointWithFluid } from '@/types/canvas';
import { PageLayoutType } from '@/types/page-layout';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfigInput from '../config-sections/ConfigInput';
import ConfigLabel from '../config-sections/ConfigLabel';
import TypeableSelect from '../config-sections/inputs/TypeableSelect';

const PAGE_TYPE_OPTIONS: Record<PageLayoutType, string> = {
  ABOUT_US: 'About Us',
  COLLECTION: 'Collection',
  COLLECTION_LIST: 'Collection List',
  HOME: 'Home',
  PRODUCT: 'Product',
  SEARCH: 'Search',
  CUSTOM: 'Custom',
};

type PageSelectProps = {
  pages: Record<string, string>;
  value: string;
  onChange: (pageId: string) => void;
};

const PageSelect = ({ pages, value, onChange }: PageSelectProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { ref, isOpen, toggle, close } = useDropdown();
  const { currentRelease } = useVendorStorefrontContext();

  const availablePageTypes = useMemo(() => {
    const existingPageTypes = new Set(
      (currentRelease?.layouts?.map((layout) => layout.type) || []).filter(
        (type) => PAGE_TYPE_OPTIONS[type] !== undefined && type !== 'CUSTOM',
      ),
    );
    return Object.fromEntries(
      Object.entries(PAGE_TYPE_OPTIONS).filter(
        ([type, _]) => !existingPageTypes.has(type as PageLayoutType),
      ),
    ) as Record<PageLayoutType, string>;
  }, [currentRelease?.layouts]);

  const usedSlugs = new Set(
    (currentRelease?.layouts?.map((layout) => layout.slug) || []).filter(
      Boolean,
    ),
  );
  if (!currentRelease) return null;

  return (
    <div ref={ref}>
      <TypeableSelect
        id='page-select'
        name='pageSelect'
        isOpen={isOpen}
        onValueChange={(nextValue) => {
          onChange(nextValue);
          close();
        }}
        currentValue={value}
        options={pages}
        onOpenChange={(nextOpen) => {
          if (nextOpen !== isOpen) toggle();
        }}
        isTypeable={false}
        showKeyValue={false}
        footer={
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              close();
              setModalOpen(true);
            }}
            className='flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left font-medium text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer'
          >
            <Icon name='plus' className='size-3.5' />
            <span>Add new page</span>
          </button>
        }
      />

      <NewPageModal
        options={availablePageTypes}
        usedSlugs={usedSlugs}
        open={modalOpen}
        setOpen={setModalOpen}
      />
    </div>
  );
};

const NewPageModal = ({
  open,
  setOpen,
  options,
  usedSlugs,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  options: Record<PageLayoutType, string>;
  usedSlugs: Set<string>;
}) => {
  const { currentRelease, revalidateLayouts } = useVendorStorefrontContext();
  const [pageType, setPageType] = useState<PageLayoutType>(
    (Object.keys(options)[0] as PageLayoutType) ?? 'CUSTOM',
  );
  const [pageName, setPageName] = useState('New Page');
  const [pageSlug, setPageSlug] = useState('new-page');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setPageType((Object.keys(options)[0] as PageLayoutType) ?? 'CUSTOM');
    setPageName('New Page');
    setPageSlug('new-page');
  };

  const handleSave = async () => {
    if (
      !currentRelease ||
      !pageName.trim() ||
      !pageSlug.trim() ||
      !pageType ||
      isSaving
    )
      return;

    if (usedSlugs.has(pageSlug.trim())) {
      toastStore.addToast({
        type: 'warning',
        message: 'Slug already exists',
      });
      return;
    }
    setIsSaving(true);
    try {
      await createStorefrontReleasePage(currentRelease.id, {
        name: pageName.trim(),
        slug: pageSlug.trim(),
        type: pageType,
      });
      await revalidateLayouts();
      resetForm();
      setOpen(false);
      toastStore.addToast({
        type: 'success',
        message: 'Page created successfully',
      });
    } catch (err) {
      toastStore.addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create page',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    if (isSaving) return;
    resetForm();
    setOpen(false);
  };
  return (
    <Modal open={open} onClose={closeModal} title='New Page' size='content'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Page Type' forId='page-type-select' size='md' />
          <ConfigInput
            id='page-type-select'
            name='type'
            inputType='select'
            selectOptions={options}
            currentValue={pageType}
            onValueChange={(val) => setPageType(val as PageLayoutType)}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Page Name' forId='page-name' size='md' />
          <ConfigInput
            id='page-name'
            name='name'
            inputType='text'
            currentValue={pageName}
            onValueChange={(val) => setPageName(val)}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Page Slug' forId='page-slug' size='md' />
          <ConfigInput
            id='page-slug'
            name='slug'
            inputType='text'
            currentValue={pageSlug}
            onValueChange={(val) => setPageSlug(val)}
          />
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2 pt-1'>
          <button
            type='button'
            onClick={closeModal}
            disabled={isSaving}
            className='rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 select-none'
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={
              !pageName.trim() || !pageSlug.trim() || !pageType || isSaving
            }
            onClick={() => void handleSave()}
            className='rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 select-none'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const CanvasTopBar = () => {
  const canvasCtx = useStorefrontCanvasContext();
  const layoutCtx = useOptionalStorefrontLayoutContext();

  const {
    breakpoint: currentBreakpoint,
    setBreakpoint: onBreakpointChange,
    zoom,
    setZoom: onZoomChange,
    isPreview,
    setIsPreview: onTogglePreview,
    currentPageId,
  } = canvasCtx;

  const canUndo = layoutCtx?.canUndo ?? canvasCtx.canUndo;
  const canRedo = layoutCtx?.canRedo ?? canvasCtx.canRedo;
  const undo = layoutCtx?.undo ?? canvasCtx.undo;
  const redo = layoutCtx?.redo ?? canvasCtx.redo;

  const { pathname, query, replace } = useRouter();
  const { currentRelease } = useVendorStorefrontContext();
  const [vpWidth, setVpWidth] = useState<number>(0);

  // Observe viewport width
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setVpWidth(entries[0].contentRect.width ?? window.innerWidth);
    });
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  // Watch for keystrokes
  useEffect(() => {
    if (!isPreview) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!canUndo) return;
        e.preventDefault();
        undo();
      } else if (
        (e.key.toLowerCase() === 'z' && e.shiftKey) ||
        e.key.toLowerCase() === 'y'
      ) {
        if (!canRedo) return;
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canRedo, canUndo, isPreview, redo, undo]);

  const handlePageChange = useCallback(
    (pageId: string) => {
      if (!currentRelease) return;
      const nextPage = currentRelease.layouts.find(
        (l) => l.id === pageId,
      )?.slug;
      if (!nextPage) return;
      void replace(
        {
          pathname,
          query: {
            ...query,
            page: nextPage,
          },
        },
        undefined,
        {
          shallow: true,
        },
      );
    },
    [currentRelease, pathname, query, replace],
  );

  const pages: Record<string, string> = (currentRelease?.layouts ?? []).reduce(
    (acc, page) => ({
      ...acc,
      [page.id]: page.name,
    }),
    {} as Record<string, string>,
  );

  const activePageId =
    (currentPageId && pages[currentPageId] ? currentPageId : null) ??
    currentRelease?.layouts.find((l) => l.type === 'HOME')?.id ??
    currentRelease?.layouts[0]?.id ??
    '';

  if (!currentRelease) return null;

  return (
    <div className='flex h-12 w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 z-20 shadow-sx'>
      <div className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1'>
        {(Object.keys(BREAKPOINT_PRESETS) as DeviceBreakpointWithFluid[]).map(
          (bp) => (
            <button
              key={bp}
              disabled={vpWidth < Number(BREAKPOINT_PRESETS[bp].width) + 80}
              type='button'
              onClick={() => onBreakpointChange(bp)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${currentBreakpoint === bp ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 not-disabled:hover:text-zinc-900'} `}
            >
              {bp.charAt(0).toUpperCase() + bp.slice(1)}
            </button>
          ),
        )}
      </div>

      <div className='flex items-center gap-3'>
        {/* Undo / Redo */}
        <div className='flex items-center gap-1'>
          <button
            type='button'
            aria-label='Undo'
            title='Undo (Ctrl+Z)'
            disabled={!canUndo || isPreview}
            onClick={undo}
            className='inline-flex items-center justify-center rounded border border-zinc-200 p-1.5 text-zinc-700 transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40'
          >
            <Icon name='rotate-ccw' className='size-3.5' />
          </button>
          <button
            type='button'
            aria-label='Redo'
            title='Redo (Ctrl+Shift+Z)'
            disabled={!canRedo || isPreview}
            onClick={redo}
            className='inline-flex items-center justify-center rounded border border-zinc-200 p-1.5 text-zinc-700 transition-colors hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40'
          >
            <Icon name='rotate-cw' className='size-3.5' />
          </button>
        </div>

        {/* Page Select */}
        <PageSelect
          pages={pages}
          value={activePageId}
          onChange={handlePageChange}
        />
        <div className='flex items-center gap-1 text-xs text-zinc-600'>
          <button
            type='button'
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            className='rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50'
          >
            -
          </button>
          <span className='font-mono w-10 text-center'>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type='button'
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
            className='rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50'
          >
            +
          </button>
        </div>

        <button
          type='button'
          onClick={() => onTogglePreview(!isPreview)}
          className={`rounded-md px-3 py-1 text-xs font-medium border transition-colors ${
            isPreview
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          {isPreview ? 'Exit Preview' : 'Preview'}
        </button>
      </div>
    </div>
  );
};

export default CanvasTopBar;
