import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useId, type CSSProperties } from 'react';

import Icon from '@/components/ui/Icon';
import { Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

import ListPanel, { AddRowButton, EmptyRows } from './ListPanel';
import RemoveButton from './RemoveButton';

/**
 * A key must remain unchanged while an item is edited or reordered. Persisted
 * items can use their API id; newly-created items should use a client UUID.
 */
export type SortableTextItemKey = string;

export type SortableTextListItem = {
  readonly key: SortableTextItemKey;
  text: string;
};

export type SortableTextListProps<
  TItem extends SortableTextListItem = SortableTextListItem,
> = {
  label: string;
  itemLabel: string;
  items: readonly TItem[];
  createItem: () => TItem;
  onChange: (items: TItem[]) => void;
  addLabel?: string;
  emptyMessage?: string;
  instructions?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  required?: boolean;
  disabled?: boolean;
};

type SortableTextListRowProps = {
  item: SortableTextListItem;
  index: number;
  itemLabel: string;
  instructionsId: string;
  placeholder?: string;
  rows: number;
  maxLength?: number;
  required: boolean;
  disabled: boolean;
  canRemove: boolean;
  onTextChange: (key: SortableTextItemKey, text: string) => void;
  onRemove: (key: SortableTextItemKey) => void;
};

function SortableTextListRow({
  item,
  index,
  itemLabel,
  instructionsId,
  placeholder,
  rows,
  maxLength,
  required,
  disabled,
  canRemove,
  onTextChange,
  onRemove,
}: SortableTextListRowProps) {
  const textareaId = useId();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key, disabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  const accessibleItemLabel = `${itemLabel} ${index + 1}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 sm:gap-3',
        isDragging && 'rounded-box bg-page opacity-90 shadow-soft',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        type='button'
        disabled={disabled}
        aria-label={`Kéo để đổi vị trí ${accessibleItemLabel}`}
        aria-describedby={instructionsId}
        className='mt-7 grid size-7.5 touch-none place-items-center rounded-control text-ink-muted outline-none select-none hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 sm:cursor-grab'
      >
        <Icon name='grip-vertical' className='size-5' />
      </button>

      <div className='flex min-w-0 flex-col gap-1.5'>
        <label htmlFor={textareaId} className='text-body font-medium text-ink-muted'>
          {accessibleItemLabel}
        </label>
        <Textarea
          id={textareaId}
          tone='accent'
          value={item.text}
          onChange={(event) => onTextChange(item.key, event.target.value)}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>

      <div className='mt-7'>
        <RemoveButton
          label={`Xóa ${accessibleItemLabel}`}
          onClick={() => onRemove(item.key)}
          disabled={disabled || !canRemove}
        />
      </div>
    </li>
  );
}

export default function SortableTextList<
  TItem extends SortableTextListItem = SortableTextListItem,
>({
  label,
  itemLabel,
  items,
  createItem,
  onChange,
  addLabel = `Thêm ${itemLabel.toLowerCase()}`,
  emptyMessage = `Chưa có ${itemLabel.toLowerCase()} nào.`,
  instructions =
    'Dùng tay cầm để kéo thả. Khi dùng bàn phím, nhấn phím cách để chọn, dùng các phím mũi tên để di chuyển, rồi nhấn phím cách lần nữa để thả.',
  placeholder,
  rows = 3,
  maxLength,
  minItems = 0,
  maxItems,
  required = false,
  disabled = false,
}: SortableTextListProps<TItem>) {
  const instructionsId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleTextChange = (key: SortableTextItemKey, text: string) => {
    onChange(
      items.map((item) =>
        item.key === key ? { ...item, text } : item,
      ),
    );
  };

  const handleRemove = (key: SortableTextItemKey) => {
    if (items.length <= minItems) {
      return;
    }

    onChange(items.filter((item) => item.key !== key));
  };

  const handleAdd = () => {
    if (maxItems !== undefined && items.length >= maxItems) {
      return;
    }

    onChange([...items, createItem()]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.key === active.id);
    const newIndex = items.findIndex((item) => item.key === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onChange(arrayMove([...items], oldIndex, newIndex));
  };

  const canAdd = maxItems === undefined || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <fieldset className='min-w-0' disabled={disabled}>
      <legend className='sr-only'>{label}</legend>
      <ListPanel>
        <p id={instructionsId} className='text-caption font-light text-ink-muted'>
          {instructions}
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{
            screenReaderInstructions: { draggable: instructions },
          }}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.key)}
            strategy={verticalListSortingStrategy}
          >
            {items.length > 0 ? (
              <ol className='flex flex-col gap-4'>
                {items.map((item, index) => (
                  <SortableTextListRow
                    key={item.key}
                    item={item}
                    index={index}
                    itemLabel={itemLabel}
                    instructionsId={instructionsId}
                    placeholder={placeholder}
                    rows={rows}
                    maxLength={maxLength}
                    required={required}
                    disabled={disabled}
                    canRemove={canRemove}
                    onTextChange={handleTextChange}
                    onRemove={handleRemove}
                  />
                ))}
              </ol>
            ) : (
              <EmptyRows>{emptyMessage}</EmptyRows>
            )}
          </SortableContext>
        </DndContext>

        <AddRowButton label={addLabel} onClick={handleAdd} disabled={disabled || !canAdd} />
      </ListPanel>
    </fieldset>
  );
}
