import { DeviceBreakpoint } from '@/types/canvas';
import { TextConfig } from '@/types/layout-component';
import { HeroBannerContent } from '@/types/layout-component/commerce-component';
import { SectionId } from '../../ComponentInspector';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';
import PositionConfig from '../PositionConfig';

type TextAlignmentType = 'left' | 'center' | 'right' | 'justify';

type HeroTextItem = {
  value?: string;
} & Partial<TextConfig>;

const QUICK_PALETTE = [
  '#000000',
  '#18181B',
  '#27272A',
  '#52525B',
  '#FFFFFF',
  '#B91C1C',
];

const TEXT_ALIGN_OPTIONS: Record<TextAlignmentType, string> = {
  left: 'Left',
  center: 'Center',
  right: 'Right',
  justify: 'Justify',
};

const FONT_WEIGHT_OPTIONS = {
  normal: 'Normal',
  'semi-bold': 'Semi Bold',
  bold: 'Bold',
  'extra-bold': 'Extra Bold',
} as const;

const FONT_STYLE_OPTIONS = {
  normal: 'Normal',
  italic: 'Italic',
  oblique: 'Oblique',
} as const;

const DECORATION_OPTIONS = {
  none: 'None',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
} as const;

const CONTENT_SIZE_OPTIONS = {
  compact: 'Compact',
  medium: 'Medium',
  large: 'Large',
  impact: 'Impact',
} as const;

interface TextConfigGroupProps {
  label: string;
  fieldPrefix: 'eyebrow' | 'title' | 'subtitle';
  item?: HeroTextItem;
  defaultColor?: string;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
}

const TextConfigGroup = ({
  label,
  fieldPrefix,
  item,
  defaultColor = '#000000',
  onUpdate,
  onActiveSectionChange,
}: TextConfigGroupProps) => {
  return (
    <div className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'>
      <span className='text-xs font-semibold text-zinc-800 uppercase tracking-wide'>
        {label}
      </span>

      {/* 1. Text Content Value */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Text' forId={`${fieldPrefix}-text`} />
        <ConfigInput
          id={`${fieldPrefix}-text`}
          name={`${fieldPrefix}.value`}
          inputType='text'
          currentValue={item?.value ?? ''}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.value`, val)}
        />
      </div>

      {/* 2. Text Color */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Color' forId={`${fieldPrefix}-color`} />
        <ConfigInput
          id={`${fieldPrefix}-color`}
          name={`${fieldPrefix}.txtColor`}
          inputType='color'
          presets={QUICK_PALETTE}
          currentValue={item?.textColor ?? defaultColor}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.txtColor`, val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 3. Align & Style */}
      <div className='grid grid-cols-2 gap-2'>
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Align' forId={`${fieldPrefix}-align`} />
          <ConfigInput
            id={`${fieldPrefix}-align`}
            name={`${fieldPrefix}.textAlign`}
            inputType='select'
            selectOptions={TEXT_ALIGN_OPTIONS}
            currentValue={item?.textAlign ?? 'left'}
            onValueChange={(val) => onUpdate(`${fieldPrefix}.textAlign`, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Style' forId={`${fieldPrefix}-style`} />
          <ConfigInput
            id={`${fieldPrefix}-style`}
            name={`${fieldPrefix}.fontStyle`}
            inputType='select'
            selectOptions={FONT_STYLE_OPTIONS}
            currentValue={item?.fontStyle ?? 'normal'}
            onValueChange={(val) => onUpdate(`${fieldPrefix}.fontStyle`, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>
      </div>

      {/* 4. Text Decoration */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Decoration' forId={`${fieldPrefix}-decoration`} />
        <ConfigInput
          id={`${fieldPrefix}-decoration`}
          name={`${fieldPrefix}.decoration`}
          inputType='select'
          selectOptions={DECORATION_OPTIONS}
          currentValue={item?.decoration ?? 'none'}
          onValueChange={(val) =>
            onUpdate(
              `${fieldPrefix}.decoration`,
              val === 'none' ? undefined : val,
            )
          }
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 5. Font Weight */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Weight' forId={`${fieldPrefix}-weight`} />
        <ConfigInput
          id={`${fieldPrefix}-weight`}
          name={`${fieldPrefix}.fontWeight`}
          inputType='select'
          selectOptions={FONT_WEIGHT_OPTIONS}
          currentValue={String(item?.fontWeight ?? 'normal')}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.fontWeight`, val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </div>
  );
};

type HeroContentSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  content: HeroBannerContent;
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  currentBp: DeviceBreakpoint;
};

const HeroContentSection = ({
  isOpen,
  toggleSection,
  content,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  currentBp,
}: HeroContentSectionProps) => {
  const id: SectionId = 'hero-content';
  const title = 'Content';
  const description =
    'Configure the content and typography of the hero banner.';

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
        {/* Alignment 3x3 Matrix */}
        <PositionConfig
          label='Content Alignment'
          forId='content-position'
          onClick={(position) =>
            onUpdate('contentPosition', position, currentBp)
          }
          position={content.contentPosition[currentBp] ?? 'top-left'}
          breakpoint={currentBp}
        />

        {/* Content Sizing */}
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Content Sizing' forId={`content-size`} />
          <ConfigInput
            id='banner-content-size'
            name='contentSize'
            inputType='select'
            selectOptions={CONTENT_SIZE_OPTIONS}
            currentValue={content.contentSize}
            onValueChange={(val) => onUpdate('contentSize', val)}
          />
        </div>

        {/* Eyebrow Controls */}
        {content.eyebrow !== undefined && (
          <TextConfigGroup
            label='Eyebrow'
            fieldPrefix='eyebrow'
            item={content.eyebrow}
            defaultColor='#71717A'
            onUpdate={onUpdate}
            onActiveSectionChange={onActiveSectionChange}
          />
        )}

        {/* Title Controls */}
        {content.title !== undefined && (
          <TextConfigGroup
            label='Title'
            fieldPrefix='title'
            item={content.title}
            defaultColor='#000000'
            onUpdate={onUpdate}
            onActiveSectionChange={onActiveSectionChange}
          />
        )}

        {/* Subtitle Controls */}
        {content.subtitle !== undefined && (
          <TextConfigGroup
            label='Subtitle'
            fieldPrefix='subtitle'
            item={content.subtitle}
            defaultColor='#71717A'
            onUpdate={onUpdate}
            onActiveSectionChange={onActiveSectionChange}
          />
        )}
      </div>
    </ConfigSectionWrapper>
  );
};

export default HeroContentSection;
