import { BaseLayoutComponentConfig } from '@/types/layout-component';
import ConfigInput from './ConfigInput';
import { SectionId } from '../ConfigSidebar';
import { useCallback, useState } from 'react';
import ConfigSectionWrapper from './ConfigSectionWrapper';

type ThemeSectionProps = {
  id: SectionId;
  title: string;
  description: string;
  isOpen: boolean;
  toggleSection: (id: SectionId) => void;
  theme: {
    colorScheme: BaseLayoutComponentConfig['colorScheme'];
    colorPalette: BaseLayoutComponentConfig['colorPalette'];
  };
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const COLOR_SCHEME_OPTIONS = {
  Default: 'default',
  Accent: 'accent',
  Inverted: 'inverted',
} as const;

const COLOR_PALETTE_OPTIONS = {
  Palette: 'palette',
  Custom: 'custom',
} as const;

const PALETTE_TOKENS = {
  Background: 'background',
  Surface: 'surface',
  Primary: 'primary',
  Secondary: 'secondary',
  Accent: 'accent',
} as const;

const ThemeSection = ({
  id,
  title,
  description,
  isOpen,
  toggleSection,
  theme,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: ThemeSectionProps) => {
  const [palette, setPalette] = useState(() => {
    const defaultNormalPalette = {
      type: 'palette' as const,
      token: 'surface',
    };
    const defaultCustomPalette = {
      type: 'custom' as const,
      bgColor: '#ffffff',
      fgColor: '#000000',
    };

    const defaultVariations = {
      palette: defaultNormalPalette,
      custom: defaultCustomPalette,
    };

    if (!theme.colorPalette) {
      return defaultVariations;
    }

    if (theme.colorPalette.type === 'palette') {
      return {
        palette: theme.colorPalette,
        custom: defaultCustomPalette,
      };
    }

    if (theme.colorPalette.type === 'custom') {
      return {
        palette: defaultNormalPalette,
        custom: theme.colorPalette,
      };
    }

    return defaultVariations;
  });

  const handlePaletteTypeChange = useCallback(
    (nextType: 'palette' | 'custom') => {
      const nextPalette = palette[nextType];
      if (nextType === 'custom') {
        onUpdate('colorPalette', {
          type: 'custom',
          bgColor:
            nextPalette.type === 'custom' ? nextPalette.bgColor : '#ffffff',
          fgColor:
            nextPalette.type === 'custom' ? nextPalette.fgColor : '#000000',
        });
      } else {
        onUpdate('colorPalette', {
          type: 'palette',
          token: nextPalette.type === 'palette' ? nextPalette.token : 'surface',
        });
      }
    },
    [onUpdate, palette],
  );

  const handleNormalPaletteUpdate = useCallback(
    (pathname: string, value: string) => {
      setPalette((prev) => {
        return {
          ...prev,
          ['palette']: {
            ...prev['palette'],
            [pathname]: value,
          },
        };
      });
      onUpdate(`colorPalette.${pathname}`, value);
    },
    [onUpdate],
  );

  const handleCustomPaletteUpdate = useCallback(
    (pathname: string, value: string) => {
      setPalette((prev) => {
        return {
          ...prev,
          ['custom']: {
            ...prev['custom'],
            [pathname]: value,
          },
        };
      });
      onUpdate(`colorPalette.${pathname}`, value);
    },
    [onUpdate],
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
      <div className='space-y-3'>
        <ConfigInput
          id='colorScheme'
          name='colorScheme'
          label='Color Scheme'
          inputType='select'
          selectOptions={COLOR_SCHEME_OPTIONS}
          currentValue={theme.colorScheme ?? 'default'}
          onValueChange={(val) => onUpdate('colorScheme', val)}
          onOpenStateChange={onActiveSectionChange}
        />

        <div className='flex items-center gap-4 flex-wrap'>
          {Object.entries(COLOR_PALETTE_OPTIONS).map(([key, value]) => (
            <ConfigInput
              key={key}
              id='palette'
              name='palette'
              label={key}
              inputType='radio'
              value={value}
              currentValue={theme.colorPalette.type}
              onValueChange={(val) => handlePaletteTypeChange(val)}
              arrangement='horizontal'
            />
          ))}
        </div>

        {theme.colorPalette.type === 'palette' && (
          <ConfigInput
            id='colorPalette.token'
            name='colorPalette.token'
            label='Token'
            inputType='select'
            selectOptions={PALETTE_TOKENS}
            currentValue={theme.colorPalette.token}
            onValueChange={(val) => handleNormalPaletteUpdate('token', val)}
            onOpenStateChange={onActiveSectionChange}
          />
        )}

        {theme.colorPalette.type === 'custom' && (
          <div
            role='radiogroup'
            aria-labelledby='Custom Color Palette'
            className='grid grid-cols-2 gap-2'
          >
            <ConfigInput
              id='colorPalette.bgColor'
              name='colorPalette.bgColor'
              label='Background Color'
              inputType='color'
              currentValue={theme.colorPalette.bgColor}
              onValueChange={(val) => handleCustomPaletteUpdate('bgColor', val)}
              onOpenStateChange={onActiveSectionChange}
            />

            <ConfigInput
              id='colorPalette.fgColor'
              name='colorPalette.fgColor'
              label='Foreground Color'
              inputType='color'
              currentValue={theme.colorPalette.fgColor}
              onValueChange={(val) => handleCustomPaletteUpdate('fgColor', val)}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>
        )}
      </div>
    </ConfigSectionWrapper>
  );
};

export default ThemeSection;
