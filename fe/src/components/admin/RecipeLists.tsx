import Badge from '@/components/ui/Badge';
import type {
  RecipeIngredient,
  RecipeNote,
  RecipeStep,
  RecipeTag,
  RecipeTool,
} from '@/types/recipe';

// Các danh sách hiển thị nội dung một công thức (trang công thức và công thức gắn trong bài).

// "200 g" — bỏ trống phần số lượng/đơn vị nếu không có.
function quantity(amount: number | string | null | undefined, unit?: string | null) {
  return [amount, unit]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' ');
}

function Empty({ children }: { children: string }) {
  return <p className='text-body-sm text-ink-muted'>{children}</p>;
}

export function IngredientList({ items }: { items: RecipeIngredient[] }) {
  if (items.length === 0) return <Empty>Chưa có nguyên liệu.</Empty>;

  return (
    <ul className='flex flex-col gap-2 text-body-sm text-ink'>
      {items.map((ingredient) => (
        <li key={ingredient.id}>
          <span className='text-ink-muted'>{quantity(ingredient.amount, ingredient.unit)}</span>{' '}
          {ingredient.name}
        </li>
      ))}
    </ul>
  );
}

export function ToolList({ items }: { items: RecipeTool[] }) {
  if (items.length === 0) return <Empty>Chưa có dụng cụ.</Empty>;

  return (
    <ul className='flex flex-col gap-2 text-body-sm text-ink'>
      {items.map((tool) => (
        <li key={tool.id}>
          <span className='text-ink-muted'>{quantity(tool.amount)}</span> {tool.name}
        </li>
      ))}
    </ul>
  );
}

export function StepList({ items }: { items: RecipeStep[] }) {
  if (items.length === 0) return <Empty>Chưa có bước nào.</Empty>;

  const steps = [...items].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <ol className='flex flex-col gap-3 text-body text-ink'>
      {steps.map((step, index) => (
        <li key={step.id} className='flex gap-3'>
          <span className='font-semibold text-ink-muted'>{index + 1}.</span>
          <span className='whitespace-pre-line'>{step.description}</span>
        </li>
      ))}
    </ol>
  );
}

export function NoteList({ items }: { items: RecipeNote[] }) {
  const notes = [...items].sort((a, b) => a.noteOrder - b.noteOrder);

  return (
    <ul className='flex list-disc flex-col gap-2 pl-5 text-body-sm text-ink'>
      {notes.map((note) => (
        <li key={note.id}>{note.content}</li>
      ))}
    </ul>
  );
}

export function TagList({ items }: { items: RecipeTag[] }) {
  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((tag) => (
        <Badge key={tag.id} tone='neutral'>
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
