import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type AlignmentSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  alignment: {
    horizontal: BaseLayoutComponentConfig['alignSelfX'];
    vertical: BaseLayoutComponentConfig['alignSelfY'];
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const HORIZONTAL_OPTIONS = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
  Stretch: 'stretch',
} as const;

const VERTICAL_OPTIONS = {
  Top: 'top',
  Center: 'center',
  Bottom: 'bottom',
  Stretch: 'stretch',
} as const;

const AlignmentSection = ({
  isOpen,
  toggleSection,
  alignment,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: AlignmentSectionProps) => {
  const id: SectionId = 'alignment';
  const title = 'Alignment';
  const description =
    'Set the horizontal and vertical alignment of the component.';

  const configs = useMemo(
    () => [
      {
        key: 'alignSelfX',
        label: 'Horizontal',
        options: HORIZONTAL_OPTIONS,
        value: alignment.horizontal ?? 'left',
      },
      {
        key: 'alignSelfY',
        label: 'Vertical',
        options: VERTICAL_OPTIONS,
        value: alignment.vertical ?? 'top',
      },
    ],
    [alignment],
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
      <div className='grid grid-cols-2 gap-2'>
        {configs.map(({ key, label, options, value }) => (
          <ConfigInput
            key={key}
            id={`alignment-${key}`}
            name={key}
            label={label}
            inputType='select'
            selectOptions={options}
            currentValue={value}
            onValueChange={(val) => onUpdate(key, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        ))}
      </div>
    </ConfigSectionWrapper>
  );
};
export default AlignmentSection;
