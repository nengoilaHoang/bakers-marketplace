import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';
import {
  AspectRatioValue,
  MediaFit,
  MediaFocalPoint,
} from '@/types/layout-component/aspect-ratio';
import { SectionId } from '../../ComponentInspector';
import { RATIO_OPTIONS } from '../aspectRatioOptions';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

const FIT_OPTIONS: Record<MediaFit, string> = {
  cover: 'Cover',
  contain: 'Contain',
  fill: 'Fill',
  none: 'None',
  'scale-down': 'Scale Down',
};

type HeroBannerImageSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  banner: {
    desktopMediaUrl: string;
    mobileMediaUrl?: string | null | undefined;
    aspect: ResponsiveProp<AspectRatioValue>;
    fit: MediaFit;
    focalPoint?: MediaFocalPoint | null | undefined;
  };
  onUpdate: (pathname: string, value: unknown, bp?: string) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  currentBp: DeviceBreakpoint;
};

const HeroBannerImageSection = ({
  isOpen,
  toggleSection,
  banner,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  currentBp,
}: HeroBannerImageSectionProps) => {
  const id: SectionId = 'hero-banner-image';
  const title = 'Banner Image';
  const description =
    'Configure the image and its display settings for the hero banner.';
  const activeAspect =
    banner.aspect[currentBp] ?? banner.aspect.desktop ?? '16:9';

  // const handleOpacityChange = (val: number) => {
  //   const clamped = Math.min(100, Math.max(0, Number.isNaN(val) ? 0 : val));
  //   onUpdate('overlay.opacity', clamped);
  // };

  return (
    <ConfigSectionWrapper
      id={id}
      title={title}
      description={description}
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      {/* 1. Desktop Image */}
      <div className='flex flex-col justify-center items-start gap-2'>
        <ConfigLabel label='Desktop Image' forId='desktop-image' />
        <ConfigInput
          id='desktop-image'
          name='desktopMediaUrl'
          inputType='file'
          currentValue={banner.desktopMediaUrl}
          onValueChange={(val) => onUpdate('desktopMediaUrl', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 2. Mobile Image */}
      <div className='flex flex-col justify-center items-start gap-2'>
        <ConfigLabel label='Mobile Image' forId='mobile-image' />
        <ConfigInput
          id='mobile-image'
          name='mobileMediaUrl'
          inputType='file'
          currentValue={banner.mobileMediaUrl ?? null}
          onValueChange={(val) => onUpdate('mobileMediaUrl', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 3. Aspect Ratio */}
      <div className='flex flex-col gap-2'>
        <ConfigLabel
          label='Aspect Ratio'
          forId='banner-aspect'
          breakpoint={currentBp}
        />
        <ConfigInput
          id='banner-aspect'
          name='aspect'
          inputType='select'
          selectOptions={RATIO_OPTIONS}
          currentValue={String(activeAspect)}
          onValueChange={(val) => onUpdate('aspect', val, currentBp)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 4. Image Scale */}
      <div className='flex flex-col gap-2'>
        <ConfigLabel label='Image Scale' forId='banner-fit' />
        <ConfigInput
          id='banner-fit'
          name='fit'
          inputType='select'
          selectOptions={FIT_OPTIONS}
          currentValue={banner.fit}
          onValueChange={(val) => onUpdate('fit', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </ConfigSectionWrapper>
  );
};

export default HeroBannerImageSection;
