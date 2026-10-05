import useDebouncedCallback from '@/hooks/useDebounceCallback';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type TypeableSelectProps<T extends string | number | boolean> = {
  id: string;
  name: string;
  options: Readonly<Record<string, T>>;
  currentValue: T;
  onValueChange: (value: T) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isTypeable?: boolean;
};

const TypeableSelect = <T extends string | number | boolean>({
  id,
  name,
  options,
  currentValue,
  onValueChange,
  isOpen,
  onOpenChange,
  isTypeable = true,
}: TypeableSelectProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [inputHeight, setInputHeight] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const enumKeys = useMemo(
    () => (options ? (Object.keys(options) as string[]) : []),
    [options],
  );
  const enumValues = useMemo(
    () => (options ? (Object.values(options) as T[]) : []),
    [options],
  );
  const convertedValues = enumValues.every((v) => typeof v === 'boolean')
    ? enumValues.map((v) => +v)
    : enumValues;

  const getKey = useCallback(
    (value: string) => {
      if (value === undefined || value === null) return '';
      const foundEntry = Object.entries(options).find(
        ([, val]) => val === value,
      );
      return foundEntry ? foundEntry[0] : value;
    },
    [options],
  );

  const [inputValue, setInputValue] = useState(getKey(String(currentValue)));

  useLayoutEffect(() => {
    if (inputRef.current) {
      setInputHeight(inputRef.current.offsetHeight);
    }
  }, []);

  const updateView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = windowHeight - containerRect.bottom;

    // Measures the real height of the options list instead of hardcoding 180
    const measuredHeight =
      contentRef.current?.scrollHeight ||
      convertedValues.length * 22 + inputHeight; // fallback to a rough estimate
    const contentHeight = Math.min(measuredHeight, 150);
    const requiredSpace = contentHeight + 8;

    setIsNearBottom(spaceBelow < requiredSpace);
  }, [convertedValues.length, inputHeight]);

  useLayoutEffect(() => {
    updateView();
    window.addEventListener('resize', updateView);
    window.addEventListener('scroll', updateView, true);

    return () => {
      window.removeEventListener('resize', updateView);
      window.removeEventListener('scroll', updateView, true);
    };
  }, [updateView]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (containerRef.current) {
  //       const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
  //       setIsNearBottom(scrollTop + clientHeight >= scrollHeight - 5);
  //     }
  //   };

  //   const container = containerRef.current;
  //   if (container) {
  //     container.addEventListener('scroll', handleScroll);
  //   }

  //   return () => {
  //     if (container) {
  //       container.removeEventListener('scroll', handleScroll);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

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
      if (!query) return;

      const matchedOption = enumKeys.find((key) =>
        key.toLowerCase().startsWith(query),
      );

      if (matchedOption) {
        onValueChange(options[matchedOption]);
        return;
      }

      const formattedNumber = Number(query);
      if (!Number.isNaN(formattedNumber)) {
        onValueChange(formattedNumber as T);
        return;
      }

      let formattedBoolean: boolean | null = null;
      if (query === 'true') {
        formattedBoolean = true;
      } else if (query === 'false') {
        formattedBoolean = false;
      }

      if (formattedBoolean !== null) {
        onValueChange(formattedBoolean as T);
      }
    },
    [enumKeys, onValueChange, options],
  );

  const handleDebouncedChange = useDebouncedCallback(handleChange, 400);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      setInputValue(getKey(nextValue));
      handleDebouncedChange(nextValue);
    },
    [handleDebouncedChange, getKey],
  );

  const handleSelectOption = (value: string) => {
    setInputValue(getKey(value));
    onValueChange(value as T);
    onOpenChange(false);
  };

  let arrowRotation = '';
  if (isOpen) {
    arrowRotation = isNearBottom ? 'rotate-90' : '-rotate-90';
  }

  return (
    <div ref={rootRef} className='relative block w-full'>
      <button
        ref={containerRef}
        tabIndex={-1}
        onClick={handleContainerClick}
        className={`block relative z-20 w-full rounded-md border border-zinc-200 text-xs text-zinc-800 transition ${
          isOpen ? 'bg-white border-zinc-950' : 'bg-zinc-50/50 hover:bg-white'
        }	focus-within:bg-white focus-within:border-zinc-950 focus-within:outline-none focus-within:ring-1 focus-within:ring-zinc-950`}
      >
        <div className='relative flex w-full min-w-0'>
          <input
            id={id}
            name={name}
            ref={inputRef}
            className='flex-1 min-w-0 px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-none'
            type='text'
            autoComplete='off'
            readOnly={isTypeable}
            onChange={handleInputChange}
            value={inputValue}
          ></input>
          <div
            className={`pointer-events-none mr-2.5 shrink-0 inset-y-0 right-0 flex items-center transition-transform duration-200 ease-in-out ${arrowRotation}`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              fill='currentColor'
              viewBox='0 0 16 16'
            >
              <path
                fillRule='evenodd'
                d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0'
              />
            </svg>
          </div>
        </div>
      </button>
      <div
        className={`grid transition-all duration-200 ease-out absolute ${isNearBottom ? 'bottom-0' : 'top-0'} left-0 w-full min-w-0 max-h-[150px] rounded-md border text-xs text-zinc-800 z-10 overflow-hidden scrollbar-none ${
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
          {convertedValues.map((val, idx) => {
            return (
              <button
                key={`${String(val)}-${idx}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectOption(String(val));
                }}
                className='appearance-none flex min-h-0 w-full items-center justify-between px-2.5 py-1.5 hover:bg-zinc-100 transition-colors cursor-pointer'
              >
                <span>{enumKeys[idx]}</span>
                <span className='font-mono text-[10px] text-zinc-400'>
                  {val}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TypeableSelect;
