import { HeroBannerOverlay } from '@/types/layout-component/commerce-component';
import { SectionId } from '../../ConfigSidebar';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

type HeroOverlaySectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  overlay: HeroBannerOverlay;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const OVERLAY_OPTIONS = {
  None: 'none',
  Solid: 'solid',
  Gradient: 'gradient',
} as const;

// Common quick-pick shades for overlays
const QUICK_PALETTE = [
  '#000000',
  '#18181B',
  '#27272A',
  '#FFFFFF',
  '#0F172A',
  '#450A0A',
];

const HeroOverlaySection = ({
  isOpen,
  toggleSection,
  overlay,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: HeroOverlaySectionProps) => {
  const id: SectionId = 'hero-overlay';
  const title = 'Overlay & Veil';
  const description =
    'Add tint or gradients to ensure text readability over backgrounds.';

  const opacityValue = overlay.type !== 'none' ? (overlay.opacity ?? 50) : 50;
  const colorValue =
    overlay.type !== 'none' ? (overlay.color ?? '#000000') : '#ffffff00';

  const handleOpacityChange = (val: number) => {
    const clamped = Math.min(100, Math.max(0, Number.isNaN(val) ? 0 : val));
    onUpdate('overlay.opacity', clamped);
  };

  return (
    <ConfigSectionWrapper
      id={id}
      title={title}
      description={description}
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-col gap-4'>
        {/* 1. Overlay Type Selector */}
        <div className='flex items-center gap-2'>
          <ConfigLabel label='Overlay Type' forId='overlay-type' />
          <ConfigInput
            id='overlay-type'
            name='overlay.type'
            inputType='select'
            selectOptions={OVERLAY_OPTIONS}
            currentValue={overlay.type}
            onValueChange={(val) => onUpdate('overlay.type', val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>

        {overlay.type !== 'none' && (
          <div className='flex flex-col gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3'>
            {/* 2. Overlay Color Picker */}
            <div className='flex flex-col gap-1.5'>
              <ConfigInput
                id='overlay-color'
                name='overlay.color'
                inputType='color'
                presets={QUICK_PALETTE}
                currentValue={colorValue}
                onValueChange={(val) => onUpdate('overlay.color', val)}
                onOpenStateChange={onActiveSectionChange}
              />
            </div>

            <div className='flex flex-col gap-2 pt-1'>
              <div className='flex items-center justify-between'>
                <ConfigLabel label='Opacity' forId='overlay-opacity' />

                {/* Compact Number Input with % suffix */}
                <div className='relative flex items-center'>
                  <input
                    id='overlay-opacity'
                    type='number'
                    min={0}
                    max={100}
                    value={opacityValue}
                    onChange={(e) =>
                      handleOpacityChange(Number(e.target.value))
                    }
                    className='w-14 rounded-md border border-zinc-200 bg-white py-1 pr-5 pl-2 text-right text-xs font-mono text-zinc-800 transition hover:bg-zinc-50 focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  />
                  <span className='pointer-events-none absolute right-2 text-[11px] text-zinc-400'>
                    %
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                id='overlay-opacity-range'
                type='range'
                min={0}
                max={100}
                step={1}
                value={opacityValue}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className='h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-zinc-900 transition hover:bg-zinc-300'
              />
            </div>
          </div>
        )}
      </div>
    </ConfigSectionWrapper>
  );
};

export default HeroOverlaySection;
