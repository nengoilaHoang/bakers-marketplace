import { BaseLayoutComponentConfig } from '@/types/layout-component';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';
import { SectionId } from '../ConfigSidebar';
import { useMemo } from 'react';

type DimensionSectionProps = {
  id: SectionId;
  title: string;
  description: string;
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  dimensions: {
    h: BaseLayoutComponentConfig['h'];
    w: BaseLayoutComponentConfig['w'];
  };
  onUpdate: (pathname: string, value: unknown) => void;
	onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const DIMENSION_OPTIONS = {
  Large: 'lg',
  Medium: 'md',
  Small: 'sm',
  Auto: 'auto',
  Full: 'full',
} as const;

const DimensionSection = ({
  id,
  title,
  description,
  isOpen,
  toggleSection,
  dimensions,
  onUpdate,
	onActiveSectionChange,
  zIndex,
}: DimensionSectionProps) => {
  const sides: ReadonlyArray<
    Readonly<{ key: keyof typeof dimensions; label: string }>
  > = useMemo(
    () => [
      { key: 'w', label: 'Width' },
      { key: 'h', label: 'Height' },
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
        {sides.map(({ key, label }) => (
          <ConfigInput
            key={key}
            id={`padding-${key}`}
            name={`padding.${key}`}
            label={label}
            inputType='select'
            selectOptions={DIMENSION_OPTIONS}
            currentValue={dimensions[key] ?? 'none'}
            onValueChange={(val) => onUpdate(key, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        ))}
      </div>
    </ConfigSectionWrapper>
  );
};

export default DimensionSection;
