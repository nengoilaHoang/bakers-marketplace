import { ResponsiveProp } from '@/types/layout-component';
import {
  AspectRatioValue,
  MediaFit,
  MediaFocalPoint,
} from '@/types/layout-component/aspect-ratio';
import { SectionId } from '../../ConfigSidebar';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

type HeroBannerImageSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  banner: {
    desktopMediaUrl: string;
    mobileMediaUrl?: string | null | undefined;
    aspect: ResponsiveProp<AspectRatioValue>;
    fit: MediaFit;
    focalPoint?: MediaFocalPoint | null | undefined;
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const HeroBannerImageSection = ({
  isOpen,
  toggleSection,
  banner,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: HeroBannerImageSectionProps) => {
  const id: SectionId = 'hero-banner-image';
  const title = 'Banner Image';
  const description =
    'Configure the image and its display settings for the hero banner.';

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
      <div className='flex items-center gap-2'>
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
      <div className='flex items-center gap-2'>
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
    </ConfigSectionWrapper>
  );
};

export default HeroBannerImageSection;
