import { DimensionType } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type DimensionSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  dimensions: {
    h: DimensionType;
    w: DimensionType;
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  isBento?: boolean;
};

const DIMENSION_OPTIONS = {
  Auto: 'auto',
  Full: 'full',
  Large: 'lg',
  Medium: 'md',
  Small: 'sm',
} as const;

const DimensionSection = ({
  isOpen,
  toggleSection,
  dimensions,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  isBento = false,
}: DimensionSectionProps) => {
  const id: SectionId = 'dimensions';
  const title = 'Dimensions';
  const description = 'Adjust the width and height of the component.';
  const sides: ReadonlyArray<
    Readonly<{ key: keyof typeof dimensions; label: string }>
  > = useMemo(
    () => [
      { key: 'w', label: 'Width' },
      { key: 'h', label: 'Height' },
    ],
    [],
  );

  const dimensionOptions = useMemo(() => {
    if (!isBento) return DIMENSION_OPTIONS;
    return Object.fromEntries(
      Object.entries(DIMENSION_OPTIONS).filter(([, value]) => value !== 'auto'),
    );
  }, [isBento]);

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
            selectOptions={dimensionOptions}
            currentValue={
              typeof dimensions[key] === 'number'
                ? dimensions[key].toFixed(2)
                : dimensions[key]
            }
            onValueChange={(val) => onUpdate(key, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        ))}
      </div>
    </ConfigSectionWrapper>
  );
};

export default DimensionSection;
