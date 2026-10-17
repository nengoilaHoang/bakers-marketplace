import { PaddingType } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type PaddingSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  padding: PaddingType;
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
  padding,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: PaddingSectionProps) => {
  const id = 'padding';
  const title = 'Padding';
  const description = 'Adjust the padding of the component.';
  const sides: ReadonlyArray<Readonly<{ key: string; label: string }>> =
    useMemo(
      () => [
        { key: 'top', label: 'Top' },
        { key: 'bottom', label: 'Bottom' },
        { key: 'left', label: 'Left' },
        { key: 'right', label: 'Right' },
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
        {sides.map(({ key, label }) => (
          <ConfigInput
            key={key}
            id={`padding-${key}`}
            name={`padding.${key}`}
            label={label}
            inputType='select'
            selectOptions={PADDING_OPTIONS}
            currentValue={String(padding[key as keyof typeof padding])}
            onValueChange={(val) => onUpdate(`padding.${key}`, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        ))}
      </div>
    </ConfigSectionWrapper>
  );
};

export default PaddingSection;
