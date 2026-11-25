import {
  AspectRatioValue,
  MediaFit,
} from '@/types/layout-component/aspect-ratio';
import { SectionId } from '../../ComponentInspector';
import { RATIO_OPTIONS } from '../aspectRatioOptions';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';
import DataPlaceholderPicker from '../inputs/DataPlaceholderPicker';
import { SAMPLE_PRODUCT_SOURCE } from './sampleProductSource';

const FIT_OPTIONS: Record<MediaFit, string> = {
  cover: 'Cover',
  contain: 'Contain',
  fill: 'Fill',
  none: 'None',
  'scale-down': 'Scale Down',
};

type ProductCardThumbnailSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  thumbnail: {
    url: string;
    fit: MediaFit;
    ratio: AspectRatioValue;
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const ProductCardThumbnailSection = ({
  isOpen,
  toggleSection,
  thumbnail,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: ProductCardThumbnailSectionProps) => {
  const id: SectionId = 'product-card-thumbnail';
  const title = 'Product Card Thumbnail';
  const description =
    'Configure the image and its display settings for the product card thumbnail.';

  return (
    <ConfigSectionWrapper
      id={id}
      title={title}
      description={description}
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      {/* 1. Thumbnail URL */}
      <div className='flex flex-col gap-2'>
        <ConfigLabel label='Thumbnail URL' forId='thumbnail-url' />
        <DataPlaceholderPicker
          id='thumbnail-url'
          name='thumbnail.url'
          currentValue={thumbnail.url}
          source={SAMPLE_PRODUCT_SOURCE}
          onValueChange={(val) => onUpdate('thumbnail.url', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 2. Thumbnail Image Ratio */}
      <div className='flex flex-col gap-2'>
        <ConfigLabel label='Thumbnail Image Ratio' forId='thumbnail-ratio' />
        <ConfigInput
          id='thumbnail-ratio'
          name='thumbnail.ratio'
          inputType='select'
          selectOptions={RATIO_OPTIONS}
          currentValue={String(thumbnail.ratio)}
          onValueChange={(val) => onUpdate('thumbnail.ratio', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 3. Thumbnail Image Scale */}
      <div className='flex flex-col gap-2'>
        <ConfigLabel label='Image Scale' forId='banner-fit' />
        <ConfigInput
          id='banner-fit'
          name='fit'
          inputType='select'
          selectOptions={FIT_OPTIONS}
          currentValue={thumbnail.fit}
          onValueChange={(val) => onUpdate('thumbnail.fit', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </ConfigSectionWrapper>
  );
};

export default ProductCardThumbnailSection;
