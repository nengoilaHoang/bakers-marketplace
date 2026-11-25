import { SectionId } from '../../ComponentInspector';
import ConfigSectionWrapper from '../ConfigSectionWrapper';
import TextConfigGroup, {
  DEFAULT_TEXT_CONFIG,
  TextConfigItem,
} from '../TextConfigGroup';
import { SAMPLE_PRODUCT_SOURCE } from './sampleProductSource';

const AddConfigButton = ({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
    >
      {text}
    </button>
  );
};

type ProductCardHeaderSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  title: TextConfigItem;
  subtitle?: TextConfigItem;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const ProductCardHeaderSection = ({
  isOpen,
  toggleSection,
  title,
  subtitle,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: ProductCardHeaderSectionProps) => {
  const id: SectionId = 'product-card-header';
  const titleString = 'Product Card Header';
  const description =
    'Configure the title and optional subtitle displayed in the product card header.';

  const handleAddSubtitle = () => {
    onUpdate('content.header.subtitle', {
      ...DEFAULT_TEXT_CONFIG,
    });
  };

  return (
    <ConfigSectionWrapper
      id={id}
      title={titleString}
      description={description}
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <TextConfigGroup
        label='Title'
        fieldPrefix='content.header.title'
        item={title}
        defaultColor='#71717A'
        dataSource={SAMPLE_PRODUCT_SOURCE}
        onUpdate={onUpdate}
        onActiveSectionChange={onActiveSectionChange}
      />
      {subtitle ? (
        <TextConfigGroup
          label='Subtitle'
          fieldPrefix='content.header.subtitle'
          item={subtitle}
          dataSource={SAMPLE_PRODUCT_SOURCE}
          onUpdate={onUpdate}
          onActiveSectionChange={onActiveSectionChange}
        />
      ) : (
        <AddConfigButton onClick={handleAddSubtitle} text='Add Subtitle' />
      )}
    </ConfigSectionWrapper>
  );
};

export default ProductCardHeaderSection;
