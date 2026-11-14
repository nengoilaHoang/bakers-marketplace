import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';
import { RowHeightMode } from '@/types/layout-component/composite-component';
import { SectionId } from '../../ComponentInspector';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

type GridTracksSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  rowHeight: ResponsiveProp<RowHeightMode>;
  gap: ResponsiveProp<number>;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  currentBp: DeviceBreakpoint;
};

const ROW_HEIGHT_MODE_OPTIONS = {
  auto: 'Auto (Min Height)',
  fixed: 'Fixed (Base Height)',
} as const;

const clampPx = (raw: number, fallback: number): number => {
  if (Number.isNaN(raw)) return fallback;
  return Math.max(0, Math.round(raw));
};

const GridTrackSection = ({
  isOpen,
  toggleSection,
  rowHeight,
  gap,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  currentBp,
}: GridTracksSectionProps) => {
  const id: SectionId = 'grid-tracks';
  const activeRowCfg: RowHeightMode = rowHeight[currentBp] ??
    rowHeight.desktop ?? { mode: 'auto', minHeightPx: 96 };
  const activeGap = gap[currentBp] ?? gap.desktop ?? 0;

  const activeHeightPx =
    activeRowCfg.mode === 'fixed'
      ? activeRowCfg.baseHeightPx
      : activeRowCfg.minHeightPx;

  const handleRowModeChange = (nextMode: string | number) => {
    if (nextMode !== 'fixed' && nextMode !== 'auto') return;
    onUpdate(
      'rowHeight',
      nextMode === 'fixed'
        ? { mode: nextMode, baseHeightPx: activeHeightPx }
        : { mode: nextMode, minHeightPx: activeHeightPx },
      currentBp,
    );
  };

  const handleRowHeightPxChange = (raw: number) => {
    const nextPx = clampPx(raw, activeHeightPx);
    const mode = activeRowCfg.mode;
    onUpdate(
      'rowHeight',
      mode === 'fixed'
        ? { mode, baseHeightPx: nextPx }
        : { mode, minHeightPx: nextPx },
      currentBp,
    );
  };

  return (
    <ConfigSectionWrapper
      id={id}
      title='Sizing & Spacing'
      description='Adjust row heights, cell gaps, and container corner radius.'
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-col gap-3'>
        {/* Row Height Group */}
        <div className='flex flex-col gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold uppercase tracking-wide text-zinc-800'>
              Row Height
            </span>
            <span className='rounded bg-white px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-500 border border-zinc-200/80'>
              {currentBp}
            </span>
          </div>

          {/* Row Height Mode */}
          <div className='flex flex-col gap-1.5'>
            <ConfigLabel label='Sizing Mode' forId='grid-row-height-mode' />
            <ConfigInput
              id='grid-row-height-mode'
              name='rowHeight.mode'
              inputType='select'
              selectOptions={ROW_HEIGHT_MODE_OPTIONS}
              currentValue={activeRowCfg.mode}
              onValueChange={handleRowModeChange}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <ConfigLabel
              label={
                activeRowCfg.mode === 'fixed' ? 'Base Height' : 'Min Height'
              }
              forId='grid-row-height-px'
            />
            <div className='relative flex items-center'>
              <ConfigInput
                id='grid-row-height-px'
                name='rowHeight'
                inputType='number'
                min={0}
                step={4}
                currentValue={activeHeightPx}
                onValueChange={handleRowHeightPxChange}
                onOpenStateChange={onActiveSectionChange}
              />
              <span className='pointer-events-none absolute right-2.5 text-[11px] text-zinc-400'>
                px
              </span>
            </div>
          </div>
        </div>

        {/* Gap */}
        <div className='flex flex-row justify-between items-center gap-1.5'>
          <ConfigLabel label={`Gap (${currentBp})`} forId='grid-gap' />
          <div className='relative flex items-center'>
            <ConfigInput
              id='grid-gap'
              name='gap'
              inputType='number'
              min={0}
              step={2}
              currentValue={activeGap}
              onValueChange={(val) =>
                onUpdate('gap', clampPx(val, activeGap), currentBp)
              }
              onOpenStateChange={onActiveSectionChange}
            />
            <span className='pointer-events-none absolute right-2.5 text-[11px] text-zinc-400'>
              px
            </span>
          </div>
        </div>
      </div>
    </ConfigSectionWrapper>
  );
};

export default GridTrackSection;
