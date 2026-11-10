import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigLabel from './ConfigLabel';
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
  const spans = useMemo<Array<{
    key: keyof BentoSectionProps['span'];
    id: string;
    name: string;
    label: string;
  }>>(
    () => [
      {
        key: 'col',
        id: 'col-span',
        name: 'colSpan',
        label: 'Column Span',
      },
      {
        key: 'row',
        id: 'row-span',
        name: 'rowSpan',
        label: 'Row Span',
      },
    ],
    [],
  );

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
        {spans.map(({ key, name, id, label }) => (
          <div
            key={name}
            className='flex flex-col gap-2 justify-start items-center'
          >
            <ConfigLabel label={label} forId={id}></ConfigLabel>
            <ConfigInput
              id={id}
              name={name}
              inputType='text'
              currentValue={span[key]}
              onValueChange={(val) => onUpdate(name, val)}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>
        ))}
      </div>
    </ConfigSectionWrapper>
  );
};

export default BentoSection;
