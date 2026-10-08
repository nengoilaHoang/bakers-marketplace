import { useState } from 'react';

import Input from '@/components/ui/Input';

import RemoveButton from '@/components/recipe/form/RemoveButton';

// Danh sách nguyên liệu: tên + định lượng, thêm/xoá dòng.
export default function IngredientRows() {
  const [rows, setRows] = useState([1, 2, 3]);
  const [nextId, setNextId] = useState(4);

  return (
    <div className='flex flex-col gap-4 rounded-media bg-surface px-5 py-10 sm:px-14'>
      <ul className='flex flex-col gap-5'>
        {rows.map((id, index) => (
          <li key={id} className='flex items-center gap-3'>
            <Input
              tone='accent'
              size='sm'
              aria-label={`Tên nguyên liệu ${index + 1}`}
              placeholder='Tên nguyên liệu'
              className='flex-4'
            />
            <Input
              tone='accent'
              size='sm'
              aria-label={`Định lượng ${index + 1}`}
              placeholder='Định lượng'
              className='flex-3'
            />
            <RemoveButton
              label={`Xoá nguyên liệu ${index + 1}`}
              onClick={() => setRows(rows.filter((row) => row !== id))}
            />
          </li>
        ))}
      </ul>
      <button
        type='button'
        onClick={() => {
          setRows([...rows, nextId]);
          setNextId(nextId + 1);
        }}
        className='self-start rounded-control px-3 py-1 text-lead font-semibold text-ink/80 outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent'
      >
        + Thêm dòng
      </button>
    </div>
  );
}
