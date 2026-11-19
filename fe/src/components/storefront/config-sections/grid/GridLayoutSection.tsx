// components/storefront/config-sections/grid/GridLayoutSection.tsx
import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';
import { GridLayoutMode } from '@/types/layout-component/composite-component';
import { SectionId } from '../../ComponentInspector';
import BreakpointContainer from '../BreakpointContainer';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

type GridLayoutSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  layout: GridLayoutMode;
  cols: ResponsiveProp<number>;
  rows?: ResponsiveProp<number>;
  densePacking: boolean;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  currentBp: DeviceBreakpoint;
};

const LAYOUT_MODE_OPTIONS: Record<GridLayoutMode, string> = {
  UNIFORM: 'Uniform',
  BENTO: 'Bento',
};

const clampTrackCount = (
  raw: number,
  fallback: number,
  max: number,
): number => {
  if (Number.isNaN(raw)) return fallback;
  return Math.min(max, Math.max(1, Math.round(raw)));
};

const GridLayoutSection = ({
  isOpen,
  toggleSection,
  layout,
  cols,
  rows,
  densePacking,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  currentBp,
}: GridLayoutSectionProps) => {
  const id: SectionId = 'grid-layout';
  const activeCols = cols[currentBp] ?? cols.desktop ?? 1;
  const activeRows = rows?.[currentBp] ?? rows?.desktop ?? 1;

  return (
    <ConfigSectionWrapper
      id={id}
      title='Grid Layout'
      description='Configure grid behavior, columns, and rows per breakpoint.'
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-col gap-3'>
        {/* Layout Mode */}
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Layout Mode' forId='grid-layout-mode' />
          <ConfigInput
            id='grid-layout-mode'
            name='layout'
            inputType='select'
            selectOptions={LAYOUT_MODE_OPTIONS}
            currentValue={layout ?? 'UNIFORM'}
            onValueChange={(val) => onUpdate('layout', val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>

        {/* Responsive Columns & Rows */}
        <BreakpointContainer label='Columns & Rows' breakpoint={currentBp}>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Columns' forId='grid-cols' />
              <ConfigInput
                id='grid-cols'
                name='cols'
                inputType='number'
                min={1}
                max={12}
                step={1}
                currentValue={activeCols}
                onValueChange={(val) =>
                  onUpdate(
                    'cols',
                    clampTrackCount(val, activeCols, 12),
                    currentBp,
                  )
                }
                onOpenStateChange={onActiveSectionChange}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Rows' forId='grid-rows' />
              <ConfigInput
                id='grid-rows'
                name='rows'
                inputType='number'
                min={1}
                max={24}
                step={1}
                currentValue={activeRows}
                onValueChange={(val) =>
                  onUpdate(
                    'rows',
                    clampTrackCount(val, activeRows, 24),
                    currentBp,
                  )
                }
                onOpenStateChange={onActiveSectionChange}
              />
            </div>
          </div>
        </BreakpointContainer>

        {/* Dense Packing */}
        <label
          htmlFor='grid-dense-packing'
          className='flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-700 transition hover:bg-white'
        >
          <span className='font-medium'>Dense Auto-Packing</span>
          <input
            id='grid-dense-packing'
            name='densePacking'
            type='checkbox'
            checked={Boolean(densePacking)}
            onChange={(e) => onUpdate('densePacking', e.target.checked)}
            className='size-4 cursor-pointer rounded border-zinc-300 accent-zinc-900'
          />
        </label>
      </div>
    </ConfigSectionWrapper>
  );
};

export default GridLayoutSection;
