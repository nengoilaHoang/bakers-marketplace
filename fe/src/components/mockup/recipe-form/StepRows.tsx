import { useState } from 'react';

import { Textarea } from '@/components/ui/Input';

import RemoveButton from '@/components/recipe/form/RemoveButton';

// Danh sách bước làm: mỗi bước một ô văn bản, thêm/xoá bước.
export default function StepRows() {
  const [steps, setSteps] = useState([1, 2]);
  const [nextId, setNextId] = useState(3);

  return (
    <div className='flex flex-col gap-4 rounded-media bg-surface px-5 py-10 sm:px-14'>
      <ol className='flex flex-col gap-4'>
        {steps.map((id, index) => (
          <li key={id} className='flex flex-col gap-1.5'>
            <label htmlFor={`step-${id}`} className='text-body font-medium text-ink-muted'>
              Bước {index + 1}
            </label>
            <div className='flex items-center gap-3'>
              <Textarea
                id={`step-${id}`}
                tone='accent'
                rows={4}
                placeholder='Hướng dẫn rõ ràng cho người đọc'
              />
              <RemoveButton
                label={`Xoá bước ${index + 1}`}
                onClick={() => setSteps(steps.filter((step) => step !== id))}
              />
            </div>
          </li>
        ))}
      </ol>
      <button
        type='button'
        onClick={() => {
          setSteps([...steps, nextId]);
          setNextId(nextId + 1);
        }}
        className='self-start rounded-control px-3 py-1 text-lead font-semibold text-ink/80 outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent'
      >
        + Thêm bước
      </button>
    </div>
  );
}
