import Icon from '@/components/ui/Icon';
import useDebouncedCallback from '@/hooks/useDebounceCallback';
import { cn } from '@/lib/cn';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type TypeableSelectProps = {
  id: string;
  name: string;
  options: Readonly<Record<string, string>>;
  currentValue: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isTypeable?: boolean;
  showKeyValue?: boolean;
  containerClassName?: string;
};

/**
- A select component that allows users to type in a value to filter the options.
- It supports string, number, and boolean types for the options.
 *
- > **Note:** Open state is handled by the parent
 *
- @template T - The type of the options (string, number, or boolean).
- @param {TypeableSelectProps<T>} props - The props for the component.
- @returns {JSX.Element} The rendered TypeableSelect component.
 */
const TypeableSelect = ({
  id,
  name,
  options,
  currentValue: currentKey,
  onValueChange,
  isOpen,
  onOpenChange,
  isTypeable = true,
  showKeyValue = true,
  containerClassName,
}: TypeableSelectProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputOverlayTextRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const optionTextRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  const [inputHeight, setInputHeight] = useState(0);
  const [inputValue, setInputValue] = useState(
    options[currentKey] ?? currentKey ?? '',
  );
  const [inputScrollOffset, setInputScrollOffset] = useState(0);

  const [isNearBottom, setIsNearBottom] = useState(false);
  const [overflowOffsets, setOverflowOffsets] = useState<
    Record<number, number>
  >({});
  const [selectableOptions, setSelectableOptions] =
    useState<Record<string, string>>(options);

  const enumKeys = useMemo(
    () => (options ? Object.keys(options) : []),
    [options],
  );
  const enumValues = useMemo(
    () => (options ? Object.values(options) : []),
    [options],
  );

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() =>
        setInputValue(options[currentKey] ?? currentKey ?? ''),
      );
    }
  }, [currentKey, isOpen, options]);

  useEffect(() => {
    queueMicrotask(() => setSelectableOptions(options));
  }, [options]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      setInputHeight(inputRef.current.offsetHeight);
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen) return;
    const element = inputOverlayTextRef.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;

    const updateInputOverflow = () => {
      if (element.scrollWidth > parent.clientWidth) {
        setInputScrollOffset(parent.clientWidth - element.scrollWidth);
      } else {
        setInputScrollOffset(0);
      }
    };

    updateInputOverflow();
    const resizeObserver = new ResizeObserver(updateInputOverflow);
    resizeObserver.observe(parent);

    return () => resizeObserver.disconnect();
  }, [inputValue, isOpen]);

  useLayoutEffect(() => {
    const updateOverflowingOptions = () => {
      const nextOffsets: Record<number, number> = {};

      Object.entries(optionTextRefs.current).forEach(([index, element]) => {
        const parent = element?.parentElement;
        if (element && parent && element.scrollWidth > parent.clientWidth) {
          nextOffsets[Number(index)] = parent.clientWidth - element.scrollWidth;
        }
      });

      setOverflowOffsets((current) => {
        const currentKeys = Object.keys(current);
        const nextKeys = Object.keys(nextOffsets);
        if (
          currentKeys.length === nextKeys.length &&
          nextKeys.every(
            (key) => current[Number(key)] === nextOffsets[Number(key)],
          )
        ) {
          return current;
        }
        return nextOffsets;
      });
    };

    updateOverflowingOptions();
    const resizeObserver = new ResizeObserver(updateOverflowingOptions);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    window.addEventListener('resize', updateOverflowingOptions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateOverflowingOptions);
    };
  }, [selectableOptions, showKeyValue, isOpen]);

  const updateView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = windowHeight - containerRect.bottom;

    // Measures the real height of the options list instead of hardcoding 180
    const measuredHeight =
      contentRef.current?.scrollHeight || enumValues.length * 22 + inputHeight; // fallback to a rough estimate
    const contentHeight = Math.min(measuredHeight, 150);
    const requiredSpace = contentHeight + 8;

    setIsNearBottom(spaceBelow < requiredSpace);
  }, [enumValues.length, inputHeight]);

  // Update the view when the window is resized or scrolled
  useLayoutEffect(() => {
    updateView();
    window.addEventListener('resize', updateView);
    window.addEventListener('scroll', updateView, true);

    return () => {
      window.removeEventListener('resize', updateView);
      window.removeEventListener('scroll', updateView, true);
    };
  }, [updateView]);

  const handleContainerClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    updateView();
    onOpenChange(!isOpen);
  }, [updateView, onOpenChange, isOpen]);

  const handleChange = useCallback(
    (rawInput: string) => {
      const query = rawInput.trim().toLowerCase();
      optionTextRefs.current = {};

      if (!query) {
        setSelectableOptions(options);
        return;
      }

      const newOptions = Object.fromEntries(
        Object.entries(options).filter(
          ([key, value]) =>
            key.toLowerCase().includes(query) ||
            value.toLowerCase().includes(query),
        ),
      );

      setSelectableOptions((prev) => (prev === newOptions ? prev : newOptions));
    },
    [options],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const rawValue = (e.target as HTMLInputElement).value
          .trim()
          .toLocaleLowerCase();
        if (!rawValue) return;

        let matchedOptionIndex = enumKeys.findIndex((key) => {
          if (typeof key === 'string') {
            return key.toLowerCase().startsWith(rawValue);
          }
          return false;
        });

        if (matchedOptionIndex === -1) {
          matchedOptionIndex = enumValues.findIndex((val) =>
            val.toLowerCase().startsWith(rawValue),
          );
        }

        if (matchedOptionIndex !== -1) {
          const matchedKey = enumKeys[matchedOptionIndex];
          if (matchedKey !== undefined) {
            onValueChange(matchedKey);
          }
          return;
        }

        const formattedNumber = Number(rawValue);
        if (!Number.isNaN(formattedNumber)) {
          onValueChange(String(formattedNumber));
        }
      }
    },
    [enumKeys, enumValues, onValueChange],
  );

  const handleDebouncedChange = useDebouncedCallback(handleChange, 400);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      setInputValue(nextValue);
      handleDebouncedChange(nextValue);
    },
    [handleDebouncedChange],
  );

  const handleSelectOption = (key: string) => {
    if (!(key in options)) return;
    const value = options[key];
    setInputValue(value);
    onValueChange(key);
    onOpenChange(false);
  };

  let arrowRotation = '';
  if (isOpen) {
    arrowRotation = isNearBottom ? 'rotate-90' : '-rotate-90';
  }

  return (
    <div className={cn('relative block w-full', containerClassName)}>
      <button
        ref={containerRef}
        tabIndex={-1}
        onClick={handleContainerClick}
        className={`group block relative z-20 w-full rounded-md border border-zinc-200 text-xs text-zinc-800 transition ${
          isOpen ? 'bg-white border-zinc-950' : 'bg-zinc-50/50 hover:bg-white'
        } focus-within:bg-white focus-within:border-zinc-950 focus-within:outline-none focus-within:ring-1 focus-within:ring-zinc-950`}
      >
        <div className='relative flex items-center w-full min-w-0'>
          <input
            id={id}
            name={name}
            ref={inputRef}
            className={cn(
              'flex-1 min-w-0 px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-none',
              !isOpen && 'text-transparent select-none',
            )}
            type='text'
            autoComplete='off'
            readOnly={!isTypeable}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            value={inputValue}
          />
          {!isOpen && (
            <div className='pointer-events-none absolute inset-y-0 left-0 right-6 flex items-center px-2.5'>
              <div className='min-w-0 flex-1 overflow-hidden text-left'>
                <span
                  ref={inputOverlayTextRef}
                  style={
                    inputScrollOffset
                      ? ({
                          '--scroll-offset': `${inputScrollOffset}px`,
                        } as React.CSSProperties)
                      : undefined
                  }
                  className={cn(
                    'inline-block whitespace-nowrap',
                    inputScrollOffset
                      ? 'group-hover:animate-scrolling-text'
                      : 'truncate max-w-full',
                  )}
                >
                  {inputValue}
                </span>
              </div>
            </div>
          )}
          <Icon
            name='chevron-left'
            label={`Arrow icon indicating the dropdown is ${isOpen ? 'open' : 'closed'}`}
            className={`pointer-events-none mr-1 inset-y-0 right-0 flex items-center transition-transform duration-200 ease-in-out ${arrowRotation}`}
          ></Icon>
        </div>
      </button>
      <div
        className={`grid transition-all duration-200 ease-out absolute ${isNearBottom ? 'bottom-0' : 'top-0'} left-0 w-full min-w-0 max-h-37.5 rounded-md border text-xs text-zinc-800 z-10 overflow-hidden scrollbar-none ${
          isOpen
            ? 'grid-rows-[1fr] bg-zinc-50 border-zinc-200 shadow-lg'
            : 'grid-rows-[0fr] bg-transparent border-transparent shadow-none pointer-events-none'
        }`}
        ref={dropdownRef}
        style={
          isNearBottom
            ? { paddingBottom: `${inputHeight}px` }
            : { paddingTop: `${inputHeight}px` }
        }
      >
        <div
          className='min-h-0 min-w-0 overflow-y-auto scrollbar-none'
          ref={contentRef}
        >
          {Object.entries(selectableOptions).map(([key, value], idx) => {
            const scrollOffset = overflowOffsets[idx];

            return (
              <button
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectOption(key);
                }}
                className='group appearance-none flex min-h-0 w-full items-center justify-between gap-2 px-2.5 py-1.5 hover:bg-zinc-100 transition-colors cursor-pointer'
              >
                <span className='min-w-0 flex-1 overflow-hidden text-left'>
                  <span
                    ref={(element) => {
                      optionTextRefs.current[idx] = element;
                    }}
                    style={
                      scrollOffset
                        ? ({
                            '--scroll-offset': `${scrollOffset}px`,
                          } as React.CSSProperties)
                        : undefined
                    }
                    className={cn(
                      'inline-block whitespace-nowrap',
                      scrollOffset
                        ? 'group-hover:animate-scrolling-text'
                        : 'truncate max-w-full',
                    )}
                  >
                    {value}
                  </span>
                </span>
                {showKeyValue && (
                  <span className='shrink-0 font-mono text-[10px] text-zinc-400'>
                    {key}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TypeableSelect;
