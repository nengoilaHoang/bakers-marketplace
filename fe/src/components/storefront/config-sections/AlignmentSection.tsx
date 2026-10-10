import { BaseLayoutComponentConfig } from '@/types/layout-component';
import { useMemo } from 'react';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type AlignmentSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  alignment: {
    horizontal: BaseLayoutComponentConfig['alignX'];
    vertical: BaseLayoutComponentConfig['alignY'];
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const ALIGNMENT_OPTIONS = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
  Top: 'top',
  Middle: 'middle',
  Bottom: 'bottom',
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
  const sides: ReadonlyArray<
    Readonly<{ key: keyof typeof alignment; label: string }>
  > = useMemo(
    () => [
      { key: 'horizontal', label: 'Horizontal' },
      { key: 'vertical', label: 'Vertical' },
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
      {sides.map(({ key, label }) => (
        <ConfigInput
          key={key}
          id={`alignment-${key}`}
          name={`alignment.${key}`}
          label={label}
          inputType='select'
          selectOptions={ALIGNMENT_OPTIONS}
          currentValue={alignment[key] ?? 'left'}
          onValueChange={(val) => onUpdate(`alignment.${key}`, val)}
          onOpenStateChange={onActiveSectionChange}
        />
      ))}
    </ConfigSectionWrapper>
  );
};
export default AlignmentSection;
