import { DeviceBreakpoint } from '@/types/canvas';
import { HeroBannerContent } from '@/types/layout-component/commerce-component';
import { SectionId } from '../../ComponentInspector';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';
import PositionConfig from '../PositionConfig';
import TextConfigGroup, { TextConfigItem } from '../TextConfigGroup';

const DEFAULT_TEXT_ITEM: TextConfigItem = {
  value: '',
  textAlign: 'left',
  decoration: 'none',
  textColor: '#71717A',
  fontWeight: 400,
  fontStyle: 'normal',
};

const AddSectionButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='self-start text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
    >
      {label}
    </button>
  );
};

const CONTENT_SIZE_OPTIONS = {
  compact: 'Compact',
  medium: 'Medium',
  large: 'Large',
  impact: 'Impact',
} as const;

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
        {content.eyebrow !== undefined ? (
          <TextConfigGroup
            label='Eyebrow'
            fieldPrefix='eyebrow'
            item={content.eyebrow}
            defaultColor='#71717A'
            onUpdate={onUpdate}
            onActiveSectionChange={onActiveSectionChange}
          />
        ) : (
          <AddSectionButton
            label='Add Eyebrow'
            onClick={() => onUpdate('eyebrow', DEFAULT_TEXT_ITEM)}
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
