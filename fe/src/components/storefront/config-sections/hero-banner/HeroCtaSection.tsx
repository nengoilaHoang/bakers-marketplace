import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';
import {
  HeroBannerContentPosition,
  HeroBannerCta,
  HeroBannerCtaColorScheme,
  HeroBannerCtaSize,
  HeroBannerCtaStyle,
  HeroBannerCtaTarget,
} from '@/types/layout-component/commerce-component';
import { SectionId } from '../../ComponentInspector';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';
import PositionConfig from '../PositionConfig';

const CTA_STYLE_OPTIONS: Record<HeroBannerCtaStyle, string> = {
  solid: 'Solid',
  outline: 'Outline',
  ghost: 'Ghost',
};

const CTA_COLOR_SCHEME_OPTIONS: Record<HeroBannerCtaColorScheme, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  neutral: 'Neutral',
};

const CTA_SIZE_OPTIONS: Record<HeroBannerCtaSize, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
};

const CTA_TARGET_OPTIONS: Record<HeroBannerCtaTarget, string> = {
  _self: 'Same Tab',
  _blank: 'New Tab',
};

const DEFAULT_CTA: HeroBannerCta = {
  label: '',
  url: '#',
  style: 'solid',
  colorScheme: 'primary',
  size: { desktop: 'md' },
  target: '_self',
};

type CtaConfigGroupProps = {
  label: string;
  fieldPrefix: 'primaryCta' | 'secondaryCta';
  cta?: HeroBannerCta;
  defaultStyle: HeroBannerCtaStyle;
  onUpdate: (pathname: string, value: unknown, bp?: DeviceBreakpoint) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  currentBp: DeviceBreakpoint;
};

const CtaConfigGroup = ({
  label,
  fieldPrefix,
  cta,
  defaultStyle,
  onUpdate,
  onActiveSectionChange,
  currentBp,
}: CtaConfigGroupProps) => {
  const current = cta ?? {
    ...DEFAULT_CTA,
    style: defaultStyle,
  };

  const currentSize = current.size[currentBp] ?? current.size.desktop ?? 'md';

  return (
    <div className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold tracking-wide text-zinc-800 uppercase'>
          {label}
        </span>
        {cta && (
          <button
            type='button'
            onClick={() => onUpdate(fieldPrefix, undefined)}
            className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
          >
            Clear
          </button>
        )}
      </div>

      {/* Label */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Label' forId={`${fieldPrefix}-label`} />
        <ConfigInput
          id={`${fieldPrefix}-label`}
          name={`${fieldPrefix}.label`}
          inputType='text'
          currentValue={current.label}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.label`, val)}
        />
      </div>

      {/* URL */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='URL' forId={`${fieldPrefix}-url`} />
        <ConfigInput
          id={`${fieldPrefix}-url`}
          name={`${fieldPrefix}.url`}
          inputType='text'
          currentValue={current.url}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.url`, val)}
        />
      </div>

      {/* Style */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Style' forId={`${fieldPrefix}-style`} />
        <ConfigInput
          id={`${fieldPrefix}-style`}
          name={`${fieldPrefix}.style`}
          inputType='select'
          selectOptions={CTA_STYLE_OPTIONS}
          currentValue={current.style}
          onValueChange={(val) =>
            onUpdate(`${fieldPrefix}.style`, val as HeroBannerCta['style'])
          }
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* Color Scheme */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel
          label='Color Scheme'
          forId={`${fieldPrefix}-colorScheme`}
        />
        <ConfigInput
          id={`${fieldPrefix}-colorScheme`}
          name={`${fieldPrefix}.colorScheme`}
          inputType='select'
          selectOptions={CTA_COLOR_SCHEME_OPTIONS}
          currentValue={current.colorScheme}
          onValueChange={(val) =>
            onUpdate(
              `${fieldPrefix}.colorScheme`,
              val as HeroBannerCta['colorScheme'],
            )
          }
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* Size */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel
          label='Size'
          forId={`${fieldPrefix}-size`}
          breakpoint={currentBp}
        />
        <ConfigInput
          id={`${fieldPrefix}-size`}
          name={`${fieldPrefix}.size`}
          inputType='select'
          selectOptions={CTA_SIZE_OPTIONS}
          currentValue={currentSize}
          onValueChange={(val) =>
            onUpdate(`${fieldPrefix}.size`, val, currentBp)
          }
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* Target */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Open In' forId={`${fieldPrefix}-target`} />
        <ConfigInput
          id={`${fieldPrefix}-target`}
          name={`${fieldPrefix}.target`}
          inputType='select'
          selectOptions={CTA_TARGET_OPTIONS}
          currentValue={current.target}
          onValueChange={(val) =>
            onUpdate(`${fieldPrefix}.target`, val as HeroBannerCta['target'])
          }
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </div>
  );
};

const AddCtaButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
    >
      Add CTA
    </button>
  );
};

type HeroCtaSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  ctaPosition?: ResponsiveProp<HeroBannerContentPosition>;
  primaryCta?: HeroBannerCta;
  secondaryCta?: HeroBannerCta;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  currentBp: DeviceBreakpoint;
};

const HeroCtaSection = ({
  isOpen,
  toggleSection,
  ctaPosition,
  primaryCta,
  secondaryCta,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  currentBp,
}: HeroCtaSectionProps) => {
  const id: SectionId = 'hero-cta';
  const activePosition =
    ctaPosition?.[currentBp] ?? ctaPosition?.desktop ?? 'middle-center'; // default to middle-center

  return (
    <ConfigSectionWrapper
      id={id}
      title='Call to Action'
      description='Configure primary and secondary action buttons and their placement.'
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      {primaryCta || secondaryCta ? (
        <div className='flex flex-col gap-4'>
          {/* CTA Alignment 3x3 Matrix */}
          <PositionConfig
            label='CTA Alignment'
            forId='cta-position'
            onClick={(pos) => onUpdate('ctaPosition', pos, currentBp)}
            position={activePosition}
            breakpoint={currentBp}
          />

          {primaryCta ? (
            <CtaConfigGroup
              label='Primary CTA'
              fieldPrefix='primaryCta'
              cta={primaryCta}
              defaultStyle='solid'
              onUpdate={onUpdate}
              onActiveSectionChange={onActiveSectionChange}
              currentBp={currentBp}
            />
          ) : (
            <AddCtaButton onClick={() => onUpdate('primaryCta', DEFAULT_CTA)} />
          )}

          {secondaryCta ? (
            <CtaConfigGroup
              label='Secondary CTA'
              fieldPrefix='secondaryCta'
              cta={secondaryCta}
              defaultStyle='outline'
              onUpdate={onUpdate}
              onActiveSectionChange={onActiveSectionChange}
              currentBp={currentBp}
            />
          ) : (
            <AddCtaButton
              onClick={() => onUpdate('secondaryCta', DEFAULT_CTA)}
            />
          )}
        </div>
      ) : null}
    </ConfigSectionWrapper>
  );
};

export default HeroCtaSection;
