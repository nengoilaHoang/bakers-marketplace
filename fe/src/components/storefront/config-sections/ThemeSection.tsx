import { SurfaceTheme } from '@/types/layout-component';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type ThemeSectionProps = {
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  surfaceTheme: SurfaceTheme;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const SURFACE_THEME_TOKENS = {
  Default: 'default',
  Surface: 'surface',
  Primary: 'primary',
  Secondary: 'secondary',
  Accent: 'accent',
} as const;

const ThemeSection = ({
  isOpen,
  toggleSection,
  surfaceTheme,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: ThemeSectionProps) => {
  const id = 'surfaceTheme';
  const title = 'Theme Surface';
  const description = 'Select a theme surface for the component.';
  const name = 'surfaceTheme';

  return (
    <ConfigSectionWrapper
      id={id}
      title={title}
      description={description}
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='space-y-3'>
        <ConfigInput
          id='surfaceTheme'
          name={name}
          label='Surface Theme'
          inputType='select'
          selectOptions={SURFACE_THEME_TOKENS}
          currentValue={surfaceTheme ?? 'default'}
          onValueChange={(val) => onUpdate(name, val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </ConfigSectionWrapper>
  );
};

export default ThemeSection;
