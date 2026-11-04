import { useState } from 'react';

import Input from '@/components/ui/Input';
import useDebouncedCallback from '@/hooks/useDebounceCallback';

type KeywordSearchProps = Readonly<{
  value: string;
  placeholder: string;
  onSearch: (keyword: string) => void;
}>;

// Ô tìm kiếm của trang danh sách: gõ xong 400ms mới gọi onSearch.
export default function KeywordSearch({ value, placeholder, onSearch }: KeywordSearchProps) {
  const [text, setText] = useState(value);
  const search = useDebouncedCallback((keyword: string) => onSearch(keyword.trim()), 400);

  return (
    <div className='w-full sm:w-72'>
      <Input
        type='search'
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setText(event.target.value);
          search(event.target.value);
        }}
      />
    </div>
  );
}
