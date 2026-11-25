import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';
import { SectionId } from '../../ComponentInspector';
import BreakpointContainer from '../BreakpointContainer';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

type CollectionGridLayoutSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  layout: 'infinite_scroll' | 'pagination';
  pageSize?: number;
  cols: ResponsiveProp<number>;
  gap: ResponsiveProp<number>;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  currentBp: DeviceBreakpoint;
};

const LAYOUT_OPTIONS = {
  pagination: 'Pagination',
  infinite_scroll: 'Infinite Scroll',
} as const;

const clampInt = (
  raw: number,
  fallback: number,
  min: number,
  max?: number,
): number => {
  if (Number.isNaN(raw)) return fallback;
  const rounded = Math.round(raw);
  const clampedMin = Math.max(min, rounded);
  return max !== undefined ? Math.min(max, clampedMin) : clampedMin;
};

const CollectionGridLayoutSection = ({
  isOpen,
  toggleSection,
  layout,
  pageSize = 8,
  cols,
  gap,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  currentBp,
}: CollectionGridLayoutSectionProps) => {
  const id: SectionId = 'collection-grid-layout';
  const activeCols = cols[currentBp] ?? cols.desktop ?? 4;
  const activeGap = gap[currentBp] ?? gap.desktop ?? 16;

  const handleLayoutChange = (nextLayout: string | number) => {
    if (nextLayout === 'pagination') {
      onUpdate('layout', 'pagination');
      onUpdate('pageSize', pageSize || 8);
    } else if (nextLayout === 'infinite_scroll') {
      onUpdate('layout', 'infinite_scroll');
    }
  };

  return (
    <ConfigSectionWrapper
      id={id}
      title='Grid & Pagination'
      description='Configure columns, spacing, and pagination behavior.'
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Pagination Mode' forId='cg-layout-mode' />
          <ConfigInput
            id='cg-layout-mode'
            name='layout'
            inputType='select'
            selectOptions={LAYOUT_OPTIONS}
            currentValue={layout}
            onValueChange={handleLayoutChange}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>

        {layout === 'pagination' && (
          <div className='flex flex-row items-center justify-between gap-2'>
            <ConfigLabel label='Page Size' forId='cg-page-size' />
            <ConfigInput
              id='cg-page-size'
              name='pageSize'
              inputType='number'
              min={1}
              max={100}
              step={1}
              currentValue={pageSize}
              onValueChange={(val) =>
                onUpdate('pageSize', clampInt(val, pageSize, 1, 100))
              }
              onOpenStateChange={onActiveSectionChange}
            />
          </div>
        )}

        <BreakpointContainer label='Columns & Spacing' breakpoint={currentBp}>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Columns' forId='cg-cols' />
              <ConfigInput
                id='cg-cols'
                name='cols'
                inputType='number'
                min={1}
                max={12}
                step={1}
                currentValue={activeCols}
                onValueChange={(val) =>
                  onUpdate(
                    'cols',
                    clampInt(val, activeCols, 1, 12),
                    currentBp,
                  )
                }
                onOpenStateChange={onActiveSectionChange}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Gap' forId='cg-gap' />
              <div className='relative flex items-center'>
                <ConfigInput
                  id='cg-gap'
                  name='gap'
                  inputType='number'
                  min={0}
                  step={2}
                  currentValue={activeGap}
                  onValueChange={(val) =>
                    onUpdate('gap', clampInt(val, activeGap, 0), currentBp)
                  }
                  onOpenStateChange={onActiveSectionChange}
                />
                <span className='pointer-events-none absolute right-2.5 text-[11px] text-zinc-400'>
                  px
                </span>
              </div>
            </div>
          </div>
        </BreakpointContainer>
      </div>
    </ConfigSectionWrapper>
  );
};

export default CollectionGridLayoutSection;
