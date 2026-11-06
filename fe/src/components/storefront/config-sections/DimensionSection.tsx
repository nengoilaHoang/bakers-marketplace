import { DimensionType } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigLabel from './ConfigLabel';
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
    Readonly<{ name: keyof typeof dimensions; label: string }>
  > = useMemo(
    () => [
      { name: 'w', label: 'Width' },
      { name: 'h', label: 'Height' },
    ],
    [],
  );

  // Filter out the "auto" option for Bento components
  // This is because Bento components have a fixed width and height, so "auto" is not a valid option.
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
      <div className='grid grid-cols-2 w-full gap-2'>
        {sides.map(({ name, label }) => {
          return (
            <div
              className='flex flex-col gap-2 justify-start items-start'
              key={name}
            >
              <ConfigLabel label={label} forId={name}></ConfigLabel>
              <ConfigInput
                id={name}
                name={name}
                inputType='select'
                selectOptions={dimensionOptions}
                currentValue={
                  typeof dimensions[name] === 'number'
                    ? dimensions[name].toFixed(2)
                    : dimensions[name]
                }
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

export default DimensionSection;
