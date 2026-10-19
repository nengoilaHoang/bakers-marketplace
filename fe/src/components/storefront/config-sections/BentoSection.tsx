import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type BentoSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  span: {
    col: number;
    row: number;
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const BentoSection = ({
  isOpen,
  toggleSection,
  span,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: BentoSectionProps) => {
  const id: SectionId = 'bento';
  const title = 'Bento';
  const description = 'Adjust the bento layout of the component.';

  return (
    <ConfigSectionWrapper
      id={id}
      title={title}
      description={description}
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-row w-full gap-2'>
        <ConfigInput
          id={`colSpan`}
          name={'colSpan'}
          label='Column Span'
          inputType='text'
          currentValue={span.col}
          onValueChange={(val) => onUpdate('colSpan', val)}
          onOpenStateChange={onActiveSectionChange}
        />
        <ConfigInput
          id={`rowSpan`}
          name={'rowSpan'}
          label='Row Span'
          inputType='text'
          currentValue={span.row}
          onValueChange={(val) => onUpdate('rowSpan', val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </ConfigSectionWrapper>
  );
};

export default BentoSection;
