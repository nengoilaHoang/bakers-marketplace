import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { DYNAMIC_PLACEHOLDER_REGEX } from '@/types/layout-component';
import { useCallback, useMemo, useState } from 'react';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';

type DataPlaceholderPickerProps = {
  id: string;
  name: string;
  currentValue: string;
  source: unknown;
  onValueChange: (value: string) => void;
  onOpenStateChange?: (isOpen: boolean) => void;
};

type FlattenedField = {
  path: string;
  type: string;
};

const traverseObject = (
  source: unknown,
  prefix: string = '',
  seen = new WeakSet(),
): Array<FlattenedField> => {
  if (source === null || typeof source !== 'object') {
    if (!prefix) return [];
    return [
      {
        path: prefix,
        type: source === null ? 'null' : typeof source,
      },
    ];
  }

  if (source instanceof Date) {
    return prefix ? [{ path: prefix, type: 'date' }] : [];
  }

  if (seen.has(source)) return [];
  seen.add(source);

  if (Array.isArray(source)) {
    return source.flatMap((item, idx) => {
      const nextPath = prefix ? `${prefix}.${idx}` : `${idx}`;
      return traverseObject(item, nextPath, seen);
    });
  }

  return Object.entries(source as Record<string, unknown>).flatMap(
    ([key, val]) => {
      if (val === undefined || typeof val === 'function') return [];
      const nextPath = prefix ? `${prefix}.${key}` : key;
      return traverseObject(val, nextPath, seen);
    },
  );
};

const resolvePathValue = (source: unknown, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, source);
};

const resolveTemplatePreview = (template: string, source: unknown): string => {
  return template.replace(DYNAMIC_PLACEHOLDER_REGEX, (raw, path: string) => {
    const resolved = resolvePathValue(source, path);
    if (resolved === undefined) return raw;
    if (resolved instanceof Date) return resolved.toISOString();
    return String(resolved);
  });
};

const DataPlaceholderPicker = ({
  id,
  name,
  currentValue,
  source,
  onValueChange,
  onOpenStateChange,
}: DataPlaceholderPickerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [constructedPlaceholder, setConstructedPlaceholder] = useState(
    () => currentValue,
  );

  const openModal = useCallback(() => {
    setConstructedPlaceholder(currentValue);
    setSearchQuery('');
    setIsModalOpen(true);
    onOpenStateChange?.(true);
  }, [currentValue, onOpenStateChange]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    onOpenStateChange?.(false);
  }, [onOpenStateChange]);

  const fields = useMemo(() => traverseObject(source), [source]);

  const fieldUsage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const match of constructedPlaceholder.matchAll(
      DYNAMIC_PLACEHOLDER_REGEX,
    )) {
      const path = match[1];
      if (path) {
        counts.set(path, (counts.get(path) ?? 0) + 1);
      }
    }
    return fields.map((field) => ({
      ...field,
      times: counts.get(field.path) ?? 0,
    }));
  }, [constructedPlaceholder, fields]);

  const filteredFields = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fieldUsage;
    return fieldUsage.filter(
      (field) =>
        field.path.toLowerCase().includes(q) ||
        field.type.toLowerCase().includes(q),
    );
  }, [fieldUsage, searchQuery]);

  const samplePreview = useMemo(
    () =>
      constructedPlaceholder
        ? resolveTemplatePreview(constructedPlaceholder, source)
        : '',
    [constructedPlaceholder, source],
  );

  const insertPlaceholder = useCallback((path: string) => {
    setConstructedPlaceholder((prev) => `${prev}{{ ${path} }}`);
  }, []);

  const handleApply = useCallback(() => {
    if (!constructedPlaceholder) return;
    onValueChange(constructedPlaceholder);
    closeModal();
  }, [closeModal, constructedPlaceholder, onValueChange]);

  const renderFieldList = () => {
    if (fields.length === 0) {
      return (
        <div className='py-8 text-center text-xs text-zinc-500'>
          No data fields available from source.
        </div>
      );
    }

    if (filteredFields.length === 0) {
      return (
        <div className='py-8 text-center text-xs text-zinc-500'>
          No matching fields found.
        </div>
      );
    }

    return (
      <table className='w-full border-collapse text-left'>
        <thead className='sticky top-0 bg-zinc-100/95 text-[11px] font-medium text-zinc-500 backdrop-blur-xs'>
          <tr>
            <th className='px-2.5 py-1.5 font-medium'>Path</th>
            <th className='px-2.5 py-1.5 font-medium'>Type</th>
            <th className='px-2.5 py-1.5 text-right font-medium'>Used</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-zinc-200/70'>
          {filteredFields.map((field) => {
            const used = field.times > 0;

            return (
              <tr
                key={field.path}
                onDoubleClick={() => insertPlaceholder(field.path)}
                title='Double-click to insert placeholder'
                className={cn(
                  'cursor-pointer select-none transition',
                  used ? 'bg-white' : 'hover:bg-white',
                )}
              >
                <td className='max-w-[260px] px-2.5 py-2'>
                  <code className='block truncate text-xs font-medium text-zinc-900'>
                    {field.path}
                  </code>
                </td>
                <td className='px-2.5 py-2'>
                  <span className='inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600'>
                    {field.type}
                  </span>
                </td>
                <td className='px-2.5 py-2 text-right'>
                  <span
                    className={cn(
                      'inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-medium',
                      used
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-500',
                    )}
                  >
                    {field.times}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <ConfigInput
        id={id}
        name={name}
        inputType='readonly'
        currentValue={currentValue}
        onOpenStateChange={(open) => {
          if (open) openModal();
        }}
      />

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title='Data Placeholder Picker'
        size='content'
      >
        <div className='flex w-full min-w-[420px] max-w-[560px] flex-col gap-4'>
          {/* Input */}
          <div className='flex flex-col gap-1.5'>
            <ConfigLabel
              label='Placeholder Template'
              forId={`${id}-template-input`}
              size='md'
            />
            <ConfigInput
              id={`${id}-template-input`}
              name={`${name}.template`}
              inputType='text'
              currentValue={constructedPlaceholder}
              onValueChange={(value) => setConstructedPlaceholder(value)}
            />
          </div>

          {/* Search */}
          <div className='relative'>
            <Icon
              name='search'
              className='pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400'
            />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search fields by path or type...'
              className='w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none'
            />
          </div>

          {/* Field list */}
          <div className='flex flex-col gap-1'>
            <div className='max-h-72 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/50'>
              {renderFieldList()}
            </div>
            <span className='text-[11px] text-zinc-400'>
              Double-click a field row to append{' '}
              <code>{'{{ path }}'}</code>.
            </span>
          </div>

          {/* Resulting Placeholder Preview */}
          <div className='flex flex-col gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2'>
            <span className='text-[11px] font-medium text-zinc-500'>
              Sample Output
            </span>
            <code className='break-all text-xs text-zinc-800'>
              {samplePreview || 'Enter text or double-click a field above'}
            </code>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-1'>
            <button
              type='button'
              onClick={closeModal}
              className='rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleApply}
              disabled={!constructedPlaceholder}
              className='rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Apply Placeholder
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DataPlaceholderPicker;
