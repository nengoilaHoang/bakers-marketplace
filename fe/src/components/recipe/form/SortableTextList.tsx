"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type CSSProperties } from "react";

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

function DragHandleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <circle cx="6" cy="5" r="1.25" />
      <circle cx="14" cy="5" r="1.25" />
      <circle cx="6" cy="10" r="1.25" />
      <circle cx="14" cy="10" r="1.25" />
      <circle cx="6" cy="15" r="1.25" />
      <circle cx="14" cy="15" r="1.25" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-4"
    >
      <path d="M4 5.5h12M8 3.5h4M6.5 5.5l.65 11h5.7l.65-11M8.5 8.5v5M11.5 8.5v5" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-4"
    >
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

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
      className={`relative grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-start gap-2 rounded-xl border bg-white p-3 transition-shadow sm:gap-3 ${
        isDragging
          ? "border-zinc-400 opacity-90 shadow-lg"
          : "border-zinc-200"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        type="button"
        disabled={disabled}
        aria-label={`Kéo để đổi vị trí ${accessibleItemLabel}`}
        aria-describedby={instructionsId}
        className="mt-1 inline-flex size-9 touch-none select-none items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 sm:cursor-grab"
      >
        <DragHandleIcon />
      </button>

      <span
        aria-hidden="true"
        className="mt-1 inline-flex size-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700"
      >
        {index + 1}
      </span>

      <div className="min-w-0">
        <label htmlFor={textareaId} className="sr-only">
          {accessibleItemLabel}
        </label>
        <textarea
          id={textareaId}
          value={item.text}
          onChange={(event) => onTextChange(item.key, event.target.value)}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className="block w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.key)}
        disabled={disabled || !canRemove}
        aria-label={`Xóa ${accessibleItemLabel}`}
        className="mt-1 inline-flex size-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RemoveIcon />
      </button>
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
    "Dùng tay cầm để kéo thả. Khi dùng bàn phím, nhấn phím cách để chọn, dùng các phím mũi tên để di chuyển, rồi nhấn phím cách lần nữa để thả.",
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
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="text-sm font-semibold text-zinc-900">{label}</legend>
      <p id={instructionsId} className="mt-1 text-sm text-zinc-500">
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
            <ol className="mt-4 space-y-3">
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
            <p
              className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center text-sm text-zinc-500"
              role="status"
            >
              {emptyMessage}
            </p>
          )}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || !canAdd}
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <AddIcon />
        {addLabel}
      </button>
    </fieldset>
  );
}
