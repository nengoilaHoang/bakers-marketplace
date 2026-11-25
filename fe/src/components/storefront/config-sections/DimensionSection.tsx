// components/storefront/config-sections/DimensionSection.tsx
import { DimensionType } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ComponentInspector';
import ConfigInput from './ConfigInput';
import ConfigLabel from './ConfigLabel';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type DimensionSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  dimensions: {
    h?: DimensionType;
    w: DimensionType;
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
  isBento?: boolean;
  hideHeight?: boolean;
};

const DIMENSION_OPTIONS = {
  auto: 'Auto',
  full: 'Full',
  lg: 'Large',
  md: 'Medium',
  sm: 'Small',
} as const;

const formatDimensionValue = (value?: DimensionType): string => {
  if (typeof value === 'number') return value.toFixed(2);
  return value ?? 'auto';
};

const DimensionSection = ({
  isOpen,
  toggleSection,
  dimensions,
  onUpdate,
  onActiveSectionChange,
  zIndex,
  isBento = false,
  hideHeight = false,
}: DimensionSectionProps) => {
  const id: SectionId = 'dimensions';
  const title = 'Dimensions';
  const description = 'Adjust the width and height of the component.';

  const dimensionOptions = useMemo(() => {
    if (!isBento) return DIMENSION_OPTIONS;
    return Object.fromEntries(
      Object.entries(DIMENSION_OPTIONS).filter(([key]) => key !== 'auto'),
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
      {!hideHeight ? (
        <div className='grid grid-cols-2 w-full gap-2'>
          {/* Width */}
          <div className='flex flex-col gap-2 justify-start items-start'>
            <ConfigLabel label='Width' forId='w' />
            <ConfigInput
              id='w'
              name='w'
              inputType='select'
              selectOptions={dimensionOptions}
              currentValue={formatDimensionValue(dimensions.w)}
              onValueChange={(val) => onUpdate('w', val)}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>

          {/* Height */}
          <div className='flex flex-col gap-2 justify-start items-start'>
            <ConfigLabel label='Height' forId='h' />
            <ConfigInput
              id='h'
              name='h'
              inputType='select'
              selectOptions={dimensionOptions}
              currentValue={formatDimensionValue(dimensions.h)}
              onValueChange={(val) => onUpdate('h', val)}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>
        </div>
      ) : (
        <div className='flex gap-2 justify-between items-center'>
          <ConfigLabel label='Width' forId='w' />
          <ConfigInput
            id='w'
            name='w'
            inputType='select'
            selectOptions={dimensionOptions}
            currentValue={formatDimensionValue(dimensions.w)}
            onValueChange={(val) => onUpdate('w', val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>
      )}
    </ConfigSectionWrapper>
  );
};

export default DimensionSection;
