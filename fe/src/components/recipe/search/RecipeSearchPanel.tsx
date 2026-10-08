import { useCallback, useId, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';
import type { RecipeSearchMatchMode } from '@/types/recipe';

import FilterDropdown, { type FilterOption } from './FilterDropdown';

type RecipeSearchPanelProps = {
  initialQuery?: string;
  initialTools?: string[];
  initialIngredients?: string[];
  initialMatchMode?: RecipeSearchMatchMode;
};

const toolOptions: FilterOption[] = [
  { value: 'oven', label: 'Lò nướng' },
  { value: 'mixer', label: 'Máy đánh trứng' },
  { value: 'stand-mixer', label: 'Máy trộn bột' },
  { value: 'scale', label: 'Cân điện tử' },
  { value: 'cake-pan', label: 'Khuôn bánh' },
  { value: 'whisk', label: 'Phới lồng' },
  { value: 'spatula', label: 'Phới dẹt' },
  { value: 'rolling-pin', label: 'Cây cán bột' },
  { value: 'air-fryer', label: 'Nồi chiên không dầu' },
  { value: 'other', label: 'Dụng cụ khác' },
];

const ingredientOptions: FilterOption[] = [
  { value: 'flour', label: 'Bột mì' },
  { value: 'sugar', label: 'Đường' },
  { value: 'egg', label: 'Trứng' },
  { value: 'butter', label: 'Bơ' },
  { value: 'milk', label: 'Sữa tươi' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'cream', label: 'Kem tươi' },
  { value: 'yeast', label: 'Men nở' },
  { value: 'baking-powder', label: 'Baking powder' },
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'other', label: 'Nguyên liệu khác' },
];

const matchModes: { value: RecipeSearchMatchMode; title: string; summary: string; explanation: string; example: string }[] = [
  {
    value: 'complete',
    title: 'Khớp đầy đủ',
    summary: 'Đủ mọi thứ để bắt đầu',
    explanation: 'Toàn bộ dụng cụ và nguyên liệu của công thức phải nằm trong hai danh sách bạn chọn. Bạn có thể chọn nhiều hơn những gì công thức cần.',
    example: 'Ví dụ: bạn có bột mì, trứng, sữa và bơ; công thức chỉ cần bột mì, trứng và sữa vẫn phù hợp, miễn là bạn cũng có đủ dụng cụ.',
  },
  {
    value: 'flexible',
    title: 'Khớp linh hoạt',
    summary: 'Thiếu tối đa 2 mục / nhóm',
    explanation: 'Cho phép công thức cần thêm tối đa 2 dụng cụ và tối đa 2 nguyên liệu ngoài danh sách bạn chọn. Hai giới hạn được tính riêng và phải đồng thời thỏa mãn.',
    example: 'Ví dụ: thiếu 1 dụng cụ và 2 nguyên liệu vẫn phù hợp. Thiếu 3 nguyên liệu thì không phù hợp, kể cả khi đã có đủ dụng cụ.',
  },
];

function normalizeSelection(values: string[], options: FilterOption[]) {
  return options.filter((option) => values.includes('all') || values.includes(option.value)).map((option) => option.value);
}

export default function RecipeSearchPanel({
  initialQuery = '',
  initialTools = [],
  initialIngredients = [],
  initialMatchMode = 'complete',
}: RecipeSearchPanelProps) {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [tools, setTools] = useState(() => normalizeSelection(initialTools, toolOptions));
  const [ingredients, setIngredients] = useState(() => normalizeSelection(initialIngredients, ingredientOptions));
  const [matchMode, setMatchMode] = useState(initialMatchMode);
  const [openDropdown, setOpenDropdown] = useState<'tools' | 'ingredients' | null>(null);
  const [helpMode, setHelpMode] = useState<RecipeSearchMatchMode | null>(null);
  const help = matchModes.find((mode) => mode.value === helpMode);
  const hasFilters = tools.length > 0 || ingredients.length > 0 || matchMode !== 'complete';
  const changeToolsOpen = useCallback((open: boolean) => {
    setOpenDropdown((current) => open ? 'tools' : current === 'tools' ? null : current);
  }, []);
  const changeIngredientsOpen = useCallback((open: boolean) => {
    setOpenDropdown((current) => open ? 'ingredients' : current === 'ingredients' ? null : current);
  }, []);

  function closeHelp() {
    setHelpMode(null);
    helpTriggerRef.current?.focus();
  }

  return (
    <form
      action='/recipes/search'
      method='get'
      role='search'
      aria-label='Tìm công thức theo dụng cụ và nguyên liệu'
      className='rounded-panel bg-page p-4 text-ink shadow-raised sm:p-6'
    >
      <div className='flex items-center gap-2 rounded-full border border-accent bg-page py-1.5 pr-1.5 pl-4 focus-within:ring-2 focus-within:ring-accent/50'>
        <Icon name='search' className='size-5 text-ink-muted' />
        <label htmlFor={`${id}-query`} className='sr-only'>Tên món hoặc từ khóa</label>
        <input
          ref={searchRef}
          id={`${id}-query`}
          type='search'
          name='q'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Bạn muốn làm món gì?'
          className='h-10 min-w-0 flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:font-light placeholder:text-placeholder [&::-webkit-search-cancel-button]:appearance-none'
        />
        {query && (
          <IconButton
            label='Xóa từ khóa'
            variant='ghost'
            size='sm'
            onClick={() => { setQuery(''); searchRef.current?.focus(); }}
          >
            <Icon name='close' className='size-4' />
          </IconButton>
        )}
        <Button type='submit'>
          <span>
            Tìm<span className='hidden sm:inline'> công thức</span>
          </span>
        </Button>
      </div>

      <div className='mt-5 mb-2.5 flex min-h-6 items-center justify-between gap-2'>
        <p className='text-caption font-light text-ink-muted'>Lọc theo những gì bạn có</p>
        <button
          type='button'
          disabled={!hasFilters}
          onClick={() => { setTools([]); setIngredients([]); setMatchMode('complete'); setOpenDropdown(null); setHelpMode(null); }}
          className='-my-2 inline-flex min-h-10 items-center rounded-control px-1 text-caption text-ink underline decoration-accent underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default disabled:text-ink-subtle disabled:no-underline'
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className='grid gap-2.5 sm:grid-cols-2'>
        <FilterDropdown name='tools' title='Dụng cụ' icon='utensils' options={toolOptions} selected={tools} onChange={setTools} open={openDropdown === 'tools'} onOpenChange={changeToolsOpen} />
        <FilterDropdown name='ingredients' title='Nguyên liệu' icon='wheat' options={ingredientOptions} selected={ingredients} onChange={setIngredients} open={openDropdown === 'ingredients'} onOpenChange={changeIngredientsOpen} />
      </div>

      <fieldset className='mt-4 border-t border-line pt-3'>
        <legend className='sr-only'>Cách đối chiếu công thức — chọn một chế độ</legend>
        <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4'>
          <span aria-hidden='true' className='text-caption font-light text-ink-muted'>Mức độ phù hợp</span>
          <div className='grid gap-2 sm:flex sm:flex-wrap'>
            {matchModes.map((mode) => (
              <div
                key={mode.value}
                className={cn(
                  'flex min-h-11 items-center gap-1 rounded-full border py-1 pr-1 pl-4 transition-colors',
                  matchMode === mode.value ? 'border-ink bg-highlight' : 'border-transparent hover:bg-highlight-soft',
                )}
              >
                <label className='flex min-h-9 flex-1 cursor-pointer items-center gap-2 text-body-sm text-ink'>
                  <input type='radio' name='matchMode' value={mode.value} checked={matchMode === mode.value} onChange={() => setMatchMode(mode.value)} aria-describedby={`${id}-${mode.value}-summary`} className='size-4 shrink-0 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-accent' />
                  <span className={matchMode === mode.value ? 'font-medium' : undefined}>{mode.title}</span>
                  <span id={`${id}-${mode.value}-summary`} className='sr-only'>{mode.summary}</span>
                </label>
                <button
                  type='button'
                  aria-label={`Giải thích ${mode.title.toLowerCase()}`}
                  aria-expanded={helpMode === mode.value}
                  aria-controls={`${id}-help`}
                  onClick={(event) => {
                    helpTriggerRef.current = event.currentTarget;
                    setHelpMode((current) => current === mode.value ? null : mode.value);
                    setOpenDropdown(null);
                  }}
                  onKeyDown={(event) => { if (event.key === 'Escape') closeHelp(); }}
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full transition-colors outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent',
                    helpMode === mode.value ? 'text-ink' : 'text-ink-subtle',
                  )}
                >
                  <Icon name='help' className='size-4.5' />
                </button>
              </div>
            ))}
          </div>
        </div>
        {help && (
          <div id={`${id}-help`} role='region' aria-label={`Giải thích ${help.title.toLowerCase()}`} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeHelp(); } }} className='mt-3 flex items-start gap-3 rounded-box bg-highlight-soft p-4 text-caption text-ink-muted'>
            <div className='min-w-0 flex-1'>
              <p className='text-body-sm font-semibold text-ink'>{help.title} · {help.summary}</p>
              <p className='mt-1'>{help.explanation}</p>
              <p className='mt-1 font-light'>{help.example}</p>
            </div>
            <IconButton label='Đóng giải thích' variant='ghost' size='sm' onClick={closeHelp} className='-mt-1 -mr-1'>
              <Icon name='close' className='size-4' />
            </IconButton>
          </div>
        )}
      </fieldset>
    </form>
  );
}
