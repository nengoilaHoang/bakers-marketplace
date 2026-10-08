import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import PlusCircle from './PlusCircle';

export type AccordionItem = { question: string; answer: ReactNode };

type AccordionProps = Readonly<{
  items: AccordionItem[];
  className?: string;
}>;

// Danh sách hỏi đáp (FAQ) dùng <details> gốc: mở/đóng không cần JavaScript.
export default function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {items.map((item) => (
        <details
          key={item.question}
          className='group rounded-control border-2 border-accent bg-page px-3 py-2.5'
        >
          <summary className='flex cursor-pointer list-none items-start gap-2 font-heading text-body font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden'>
            <span className='flex-1'>{item.question}</span>
            <PlusCircle collapsible className='mt-1 size-4' />
          </summary>
          <div className='pt-2 text-body-sm text-ink-muted'>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
