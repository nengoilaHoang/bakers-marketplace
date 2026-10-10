import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type PaddingSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  padding: BaseLayoutComponentConfig['padding'];
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
  const sides: ReadonlyArray<
    Readonly<{ key: keyof typeof padding; label: string }>
  > = useMemo(
    () => [
      { key: 'top', label: 'Top' },
      { key: 'right', label: 'Right' },
      { key: 'bottom', label: 'Bottom' },
      { key: 'left', label: 'Left' },
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
      <div className='grid grid-cols gap-2'>
        {sides.map(({ key, label }) => (
          <ConfigInput
            key={key}
            id={`padding-${key}`}
            name={`padding.${key}`}
            label={label}
            inputType='select'
            selectOptions={PADDING_OPTIONS}
            currentValue={padding[key] ?? 'none'}
            onValueChange={(val) => onUpdate(`padding.${key}`, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        ))}
      </div>
    </ConfigSectionWrapper>
  );
};

export default PaddingSection;
