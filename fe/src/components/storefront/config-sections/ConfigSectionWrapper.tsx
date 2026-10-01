import { SectionId } from '../ConfigSidebar';

type ConfigSectionProps = {
  id: SectionId;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
  zIndex?: number;
};

const ConfigSectionWrapper = ({
  id,
  title,
  description,
  isOpen,
  onToggle,
  children,
  zIndex = 10,
}: ConfigSectionProps) => {
  return (
    <div
      className='relative border-b border-zinc-200/80 transition-colors'
      style={{ zIndex }}
    >
      <button
        type='button'
        onClick={() => onToggle(id)}
        className='flex w-full items-center justify-between text-left hover:bg-zinc-50 transition-colors'
      >
        <span className='text-xs font-semibold uppercase tracking-wide text-zinc-700'>
          {title}
        </span>
        <span
          className={`text-[10px] text-zinc-400 transition-transform duration-200 ease-out select-none ${isOpen ? '-rotate-90' : ''}`.trim()}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            fill='currentColor'
            viewBox='0 0 16 16'
          >
            <path d='m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z' />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] overflow-hidden'}`}
      >
        <div
          className={`min-w-0 min-h-0`}
        >
          <div className={`pb-4 pt-0 space-y-3`}>
            {description && (
              <p className='text-xs text-zinc-500 leading-relaxed'>
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigSectionWrapper;
