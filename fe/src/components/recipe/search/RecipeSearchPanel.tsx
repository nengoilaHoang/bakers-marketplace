import { useCallback, useId, useRef, useState } from "react";

import type { RecipeSearchMatchMode } from "@/types/recipe";

import FilterDropdown, { type FilterOption } from "./FilterDropdown";
import SearchIcon from "./SearchIcon";

type RecipeSearchPanelProps = {
  initialQuery?: string;
  initialTools?: string[];
  initialIngredients?: string[];
  initialMatchMode?: RecipeSearchMatchMode;
};

const toolOptions: FilterOption[] = [
  { value: "oven", label: "Lò nướng" },
  { value: "mixer", label: "Máy đánh trứng" },
  { value: "stand-mixer", label: "Máy trộn bột" },
  { value: "scale", label: "Cân điện tử" },
  { value: "cake-pan", label: "Khuôn bánh" },
  { value: "whisk", label: "Phới lồng" },
  { value: "spatula", label: "Phới dẹt" },
  { value: "rolling-pin", label: "Cây cán bột" },
  { value: "air-fryer", label: "Nồi chiên không dầu" },
  { value: "other", label: "Dụng cụ khác" },
];

const ingredientOptions: FilterOption[] = [
  { value: "flour", label: "Bột mì" },
  { value: "sugar", label: "Đường" },
  { value: "egg", label: "Trứng" },
  { value: "butter", label: "Bơ" },
  { value: "milk", label: "Sữa tươi" },
  { value: "chocolate", label: "Chocolate" },
  { value: "cream", label: "Kem tươi" },
  { value: "yeast", label: "Men nở" },
  { value: "baking-powder", label: "Baking powder" },
  { value: "vanilla", label: "Vanilla" },
  { value: "other", label: "Nguyên liệu khác" },
];

const matchModes: { value: RecipeSearchMatchMode; title: string; summary: string; explanation: string; example: string }[] = [
  {
    value: "complete",
    title: "Khớp đầy đủ",
    summary: "Đủ mọi thứ để bắt đầu",
    explanation: "Toàn bộ dụng cụ và nguyên liệu của công thức phải nằm trong hai danh sách bạn chọn. Bạn có thể chọn nhiều hơn những gì công thức cần.",
    example: "Ví dụ: bạn có bột mì, trứng, sữa và bơ; công thức chỉ cần bột mì, trứng và sữa vẫn phù hợp, miễn là bạn cũng có đủ dụng cụ.",
  },
  {
    value: "flexible",
    title: "Khớp linh hoạt",
    summary: "Thiếu tối đa 2 mục / nhóm",
    explanation: "Cho phép công thức cần thêm tối đa 2 dụng cụ và tối đa 2 nguyên liệu ngoài danh sách bạn chọn. Hai giới hạn được tính riêng và phải đồng thời thỏa mãn.",
    example: "Ví dụ: thiếu 1 dụng cụ và 2 nguyên liệu vẫn phù hợp. Thiếu 3 nguyên liệu thì không phù hợp, kể cả khi đã có đủ dụng cụ.",
  },
];

function normalizeSelection(values: string[], options: FilterOption[]) {
  return options.filter((option) => values.includes("all") || values.includes(option.value)).map((option) => option.value);
}

export default function RecipeSearchPanel({
  initialQuery = "",
  initialTools = [],
  initialIngredients = [],
  initialMatchMode = "complete",
}: RecipeSearchPanelProps) {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [tools, setTools] = useState(() => normalizeSelection(initialTools, toolOptions));
  const [ingredients, setIngredients] = useState(() => normalizeSelection(initialIngredients, ingredientOptions));
  const [matchMode, setMatchMode] = useState(initialMatchMode);
  const [openDropdown, setOpenDropdown] = useState<"tools" | "ingredients" | null>(null);
  const [helpMode, setHelpMode] = useState<RecipeSearchMatchMode | null>(null);
  const help = matchModes.find((mode) => mode.value === helpMode);
  const hasFilters = tools.length > 0 || ingredients.length > 0 || matchMode !== "complete";
  const changeToolsOpen = useCallback((open: boolean) => {
    setOpenDropdown((current) => open ? "tools" : current === "tools" ? null : current);
  }, []);
  const changeIngredientsOpen = useCallback((open: boolean) => {
    setOpenDropdown((current) => open ? "ingredients" : current === "ingredients" ? null : current);
  }, []);

  function closeHelp() {
    setHelpMode(null);
    helpTriggerRef.current?.focus();
  }

  return (
    <form
      action="/recipes/search"
      method="get"
      role="search"
      aria-label="Tìm công thức theo dụng cụ và nguyên liệu"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white p-1.5 transition focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-950/5">
        <span className="pointer-events-none flex size-10 shrink-0 items-center justify-center text-zinc-400">
          <SearchIcon name="search" />
        </span>
        <label htmlFor={`${id}-query`} className="sr-only">Tên món hoặc từ khóa</label>
        <input
          ref={searchRef}
          id={`${id}-query`}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Bạn muốn làm món gì?"
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-zinc-950 outline-none placeholder:text-zinc-400 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Xóa từ khóa" className="flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-zinc-950">
            <SearchIcon name="close" className="size-4" />
          </button>
        )}
        <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 sm:px-6">
          Tìm<span className="hidden sm:inline">&nbsp;công thức</span>
        </button>
      </div>

      <div className="mb-2.5 mt-4 flex min-h-6 items-center justify-between gap-2">
        <p className="text-xs font-medium text-zinc-500">Lọc theo những gì bạn có</p>
        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => { setTools([]); setIngredients([]); setMatchMode("complete"); setOpenDropdown(null); setHelpMode(null); }}
          className="-my-2 inline-flex min-h-10 items-center rounded-md px-1 text-xs font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-950 disabled:cursor-default disabled:text-zinc-300 disabled:no-underline"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <FilterDropdown name="tools" title="Dụng cụ" icon="tool" options={toolOptions} selected={tools} onChange={setTools} open={openDropdown === "tools"} onOpenChange={changeToolsOpen} />
        <FilterDropdown name="ingredients" title="Nguyên liệu" icon="ingredient" options={ingredientOptions} selected={ingredients} onChange={setIngredients} open={openDropdown === "ingredients"} onOpenChange={changeIngredientsOpen} />
      </div>

      <fieldset className="mt-4 border-t border-zinc-100 pt-3">
        <legend className="sr-only">Cách đối chiếu công thức — chọn một chế độ</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
          <span aria-hidden="true" className="text-xs text-zinc-500">Mức độ phù hợp</span>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            {matchModes.map((mode) => (
              <div key={mode.value} className={`flex min-h-11 items-center gap-1 rounded-xl border py-1 pl-3 pr-1 transition ${matchMode === mode.value ? "border-zinc-300 bg-zinc-100" : "border-transparent bg-white hover:bg-zinc-50"}`}>
                <label className="flex min-h-9 flex-1 cursor-pointer items-center gap-2 text-sm text-zinc-800">
                  <input type="radio" name="matchMode" value={mode.value} checked={matchMode === mode.value} onChange={() => setMatchMode(mode.value)} aria-describedby={`${id}-${mode.value}-summary`} className="size-4 shrink-0 accent-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950" />
                  <span className={matchMode === mode.value ? "font-medium" : ""}>{mode.title}</span>
                  <span id={`${id}-${mode.value}-summary`} className="sr-only">{mode.summary}</span>
                </label>
                <button
                  type="button"
                  aria-label={`Giải thích ${mode.title.toLowerCase()}`}
                  aria-expanded={helpMode === mode.value}
                  aria-controls={`${id}-help`}
                  onClick={(event) => {
                    helpTriggerRef.current = event.currentTarget;
                    setHelpMode((current) => current === mode.value ? null : mode.value);
                    setOpenDropdown(null);
                  }}
                  onKeyDown={(event) => { if (event.key === "Escape") closeHelp(); }}
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-zinc-950 ${helpMode === mode.value ? "text-zinc-950" : "text-zinc-400"}`}
                >
                  <SearchIcon name="help" className="size-[18px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {help && (
          <div id={`${id}-help`} role="region" aria-label={`Giải thích ${help.title.toLowerCase()}`} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeHelp(); } }} className="mt-3 flex items-start gap-3 rounded-xl bg-zinc-50 p-3.5 text-xs leading-5 text-zinc-600">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900">{help.title} · {help.summary}</p>
              <p className="mt-1">{help.explanation}</p>
              <p className="mt-1 text-zinc-500">{help.example}</p>
            </div>
            <button type="button" aria-label="Đóng giải thích" onClick={closeHelp} className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-zinc-950"><SearchIcon name="close" className="size-4" /></button>
          </div>
        )}
      </fieldset>
    </form>
  );
}
