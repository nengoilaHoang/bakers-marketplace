import { BaseLayoutComponentConfig } from '@/types/layout-component';
import ConfigInput from './ConfigInput';
import { SectionId } from '../ConfigSidebar';
import ConfigSectionWrapper from './ConfigSectionWrapper';
import { useMemo } from 'react';

type PaddingSectionProps = {
  id: SectionId;
  title: string;
  description: string;
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
  id,
  title,
  description,
  isOpen,
  toggleSection,
  padding,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: PaddingSectionProps) => {
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
