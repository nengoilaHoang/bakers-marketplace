import { SurfaceTheme } from '@/types/layout-component';
import { SectionId } from '../ConfigSidebar';
import ConfigInput from './ConfigInput';
import ConfigLabel from './ConfigLabel';
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
  default: 'Default',
  surface: 'Surface',
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
} as const;

const ThemeSection = ({
  isOpen,
  toggleSection,
  surfaceTheme,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: ThemeSectionProps) => {
  const id = 'theme';
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
      <div className='flex flex-row justify-center items-start gap-2'>
        <ConfigLabel label='Surface Theme' forId='surface-theme' />
        <ConfigInput
          id='surface-theme'
          name={name}
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
