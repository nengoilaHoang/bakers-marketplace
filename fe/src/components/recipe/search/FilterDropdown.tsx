import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export type FilterOption = { value: string; label: string };

type FilterDropdownProps = {
  name: string;
  title: string;
  icon: 'utensils' | 'wheat';
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}

export default function FilterDropdown({
  name,
  title,
  icon,
  options,
  selected,
  onChange,
  open,
  onOpenChange,
}: FilterDropdownProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const allRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const allSelected = selected.length === options.length;
  const someSelected = selected.length > 0 && !allSelected;
  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);
  const filteredOptions = options.filter((option) =>
    normalizeSearch(option.label).includes(normalizeSearch(query)),
  );

  useLayoutEffect(() => {
    if (!open) return;

    function positionPanel() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const bounds = trigger.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom =
        viewportTop + (viewport?.height ?? window.innerHeight);
      const below = viewportBottom - bounds.bottom - 16;
      const above = bounds.top - viewportTop - 16;
      const openAbove = below < 260 && above > below;

      panel.style.top = openAbove ? 'auto' : '100%';
      panel.style.bottom = openAbove ? '100%' : 'auto';
      panel.style.marginTop = openAbove ? '0' : '8px';
      panel.style.marginBottom = openAbove ? '8px' : '0';
      panel.style.maxHeight = `${Math.max(180, openAbove ? above : below)}px`;
    }

    positionPanel();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    window.visualViewport?.addEventListener('resize', positionPanel);
    window.visualViewport?.addEventListener('scroll', positionPanel);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
      window.visualViewport?.removeEventListener('resize', positionPanel);
      window.visualViewport?.removeEventListener('scroll', positionPanel);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        onOpenChange(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someSelected;
  }, [someSelected, open]);

  function close() {
    onOpenChange(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className='relative min-w-0'
      onBlur={(event) => {
        // Disabling the clear button after clearing may blur it without moving
        // focus outside. Keep the list open so another selection is possible.
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          onOpenChange(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      {/* Keep selected values in the GET form even while the popup is closed. */}
      {selected.map((value) => (
        <input key={value} type='hidden' name={name} value={value} />
      ))}
      <button
        ref={triggerRef}
        type='button'
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => {
          setQuery('');
          onOpenChange(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setQuery('');
            onOpenChange(true);
          }
        }}
        className={cn(
          'flex min-h-14 w-full items-center gap-3 rounded-control border px-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent',
          open
            ? 'border-accent bg-page ring-2 ring-accent/40'
            : selected.length
              ? 'border-ink bg-page hover:border-accent'
              : 'border-border bg-field hover:border-accent',
        )}
      >
        <Icon name={icon} className='size-6 text-primary' />
        <span className='min-w-0 flex-1'>
          <span className='flex items-center gap-2 text-body-sm font-medium text-ink'>
            {title}
            {selected.length > 0 && (
              <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-micro font-semibold text-on-primary'>
                {selected.length}
              </span>
            )}
          </span>
          <span className='mt-0.5 block truncate text-caption font-light text-ink-muted'>
            {allSelected
              ? 'Đã chọn tất cả'
              : selectedLabels.join(', ') || 'Chọn những gì bạn có'}
          </span>
        </span>
        <Icon
          name='chevron-down'
          className={cn(
            'size-4 text-ink-subtle transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={`${id}-panel`}
          className='absolute inset-x-0 top-full z-30 mt-2 flex flex-col rounded-box border border-line bg-page p-2 shadow-soft'
        >
          <div className='flex h-11 shrink-0 items-center gap-2 rounded-full bg-surface-soft px-3 focus-within:ring-2 focus-within:ring-accent/50'>
            <Icon name='search' className='size-4 text-ink-muted' />
            <input
              ref={searchRef}
              type='text'
              aria-label={`Tìm trong ${title.toLowerCase()}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              placeholder={`Tìm ${title.toLowerCase()}...`}
              autoComplete='off'
              className='h-full min-w-0 flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:text-placeholder'
            />
          </div>

          <div
            role='group'
            aria-label={`${title} bạn có`}
            className='mt-1 flex min-h-0 min-w-0 flex-col'
          >
            <label className='flex min-h-11 shrink-0 cursor-pointer items-center gap-3 border-b border-line px-3 text-body-sm font-medium text-ink'>
              <input
                ref={allRef}
                type='checkbox'
                checked={allSelected}
                onChange={() =>
                  onChange(
                    allSelected ? [] : options.map((option) => option.value),
                  )
                }
                className='size-4 shrink-0 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-accent'
              />
              <span className='flex-1'>Tất cả</span>
              <span className='text-caption font-light text-ink-subtle'>
                {options.length} mục
              </span>
            </label>
            <div className='max-h-60 min-h-0 overflow-y-auto overscroll-contain py-1'>
              {filteredOptions.length ? (
                filteredOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-3 text-body-sm transition-colors hover:bg-highlight-soft',
                      selected.includes(option.value) ? 'text-ink' : 'text-ink-muted',
                      option.value === 'other' && 'border-t border-line',
                    )}
                  >
                    <input
                      type='checkbox'
                      checked={selected.includes(option.value)}
                      onChange={(event) =>
                        onChange(
                          event.target.checked
                            ? [...selected, option.value]
                            : selected.filter(
                                (value) => value !== option.value,
                              ),
                        )
                      }
                      className='size-4 shrink-0 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-accent'
                    />
                    <span>{option.label}</span>
                  </label>
                ))
              ) : (
                <p
                  role='status'
                  className='px-3 py-6 text-center text-body-sm text-ink-muted'
                >
                  Không tìm thấy mục phù hợp.
                </p>
              )}
            </div>
          </div>

          <div className='flex shrink-0 items-center justify-between gap-2 border-t border-line px-1 pt-2'>
            <Button
              variant='ghost'
              size='sm'
              disabled={!selected.length}
              onClick={() => onChange([])}
            >
              Bỏ chọn tất cả
            </Button>
            <Button size='sm' onClick={close}>
              Xong{selected.length > 0 ? ` · ${selected.length}` : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
