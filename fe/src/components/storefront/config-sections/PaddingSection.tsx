import { PaddingType } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigLabel from './ConfigLabel';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type PaddingSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  paddings: {
    top: PaddingType;
    bottom: PaddingType;
    left: PaddingType;
    right: PaddingType;
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const PADDING_OPTIONS = {
  None: 'none',
  Small: 'sm',
  Medium: 'md',
  Large: 'lg',
} as const;

const PaddingSection = ({
  isOpen,
  toggleSection,
  paddings,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: PaddingSectionProps) => {
  const id = 'padding';
  const title = 'Padding';
  const description = 'Adjust the padding of the component.';
  const sides = useMemo(
    () => [
      { id: 'padding-top', key: 'top', name: 'padding.top', label: 'Top' },
      {
        id: 'padding-bottom',
        key: 'bottom',
        name: 'padding.bottom',
        label: 'Bottom',
      },
      { id: 'padding-left', key: 'left', name: 'padding.left', label: 'Left' },
      {
        id: 'padding-right',
        key: 'right',
        name: 'padding.right',
        label: 'Right',
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
      <div className='grid grid-cols-2 gap-2'>
        {sides.map(({ name, key, label, id }) => {
          return (
            <div
              key={name}
              className='flex flex-col gap-2 justify-start items-center'
            >
              <ConfigLabel label={label} forId={id}></ConfigLabel>
              <ConfigInput
                id={id}
                name={name}
                inputType='select'
                selectOptions={PADDING_OPTIONS}
                currentValue={String(paddings[key as keyof typeof paddings])}
                onValueChange={(val) => onUpdate(name, val)}
                onOpenStateChange={onActiveSectionChange}
              />
            </div>
          );
        })}
      </div>
    </ConfigSectionWrapper>
  );
};

export default PaddingSection;
