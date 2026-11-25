import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import ConfigInput from '@/components/storefront/config-sections/ConfigInput';
import ConfigLabel from '@/components/storefront/config-sections/ConfigLabel';
import SaveButton from '@/components/storefront/SaveButton';
import StorefrontReleasePreview from '@/components/storefront/StorefrontReleasePreview';
import useVendorStorefrontContext from '@/hooks/storefront/useVendorStorefrontContext';
import { NextPageWithLayout } from '@/pages/_app';
import { ColorPalette, FontType, Typography } from '@/types/theme-settings';
import { useMemo } from 'react';

const DEFAULT_COLOR_PALETTE: ColorPalette = {
  id: 'default-palette',
  colorBackground: '#FAF7F2',
  colorSurface: '#FFFFFF',
  colorBorder: '#E4E4E7',
  colorTextPrimary: '#18181B',
  colorTextSecondary: '#52525B',
  colorPrimary: '#D97706',
  colorPrimaryForeground: '#FFFFFF',
  colorSecondary: '#F4F4F5',
  colorSecondaryForeground: '#18181B',
  colorAccent: '#92400E',
  colorAccentForeground: '#FFFFFF',
};

const DEFAULT_TYPOGRAPHY: Typography = {
  id: 'default-typography',
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  headingWeight: 700,
  bodyWeight: 400,
  headingLineHeight: 1.2,
  bodyLineHeight: 1.6,
  headingLetterSpacing: -0.02,
  bodyLetterSpacing: 0,
};

const FONT_OPTIONS: Record<FontType, string> = {
  Arial: 'Arial',
  Helvetica: 'Helvetica',
  Verdana: 'Verdana',
  'Trebuchet MS': 'Trebuchet MS',
  Tahoma: 'Tahoma',
  'Segoe UI': 'Segoe UI',
  Calibri: 'Calibri',
  Candara: 'Candara',
  Corbel: 'Corbel',
  'Lucida Sans': 'Lucida Sans',
  'Lucida Grande': 'Lucida Grande',
  'Gill Sans': 'Gill Sans',
  Futura: 'Futura',
  'Century Gothic': 'Century Gothic',
  Optima: 'Optima',
  Geneva: 'Geneva',
  'Franklin Gothic Medium': 'Franklin Gothic Medium',
  Impact: 'Impact',
  'Arial Black': 'Arial Black',
  'Times New Roman': 'Times New Roman',
  Times: 'Times',
  Georgia: 'Georgia',
  Garamond: 'Garamond',
  Cambria: 'Cambria',
  Baskerville: 'Baskerville',
  Palatino: 'Palatino',
  'Palatino Linotype': 'Palatino Linotype',
  'Book Antiqua': 'Book Antiqua',
  Didot: 'Didot',
  'Bodoni MT': 'Bodoni MT',
  Constantia: 'Constantia',
  'Big Caslon': 'Big Caslon',
  'Courier New': 'Courier New',
  Courier: 'Courier',
  'Lucida Console': 'Lucida Console',
  Monaco: 'Monaco',
  Consolas: 'Consolas',
  Menlo: 'Menlo',
  'Andale Mono': 'Andale Mono',
  'Comic Sans MS': 'Comic Sans MS',
  'Brush Script MT': 'Brush Script MT',
  Copperplate: 'Copperplate',
  Papyrus: 'Papyrus',
  Inter: 'Inter',
  Geist: 'Geist',
  'Plus Jakarta Sans': 'Plus Jakarta Sans',
  Manrope: 'Manrope',
  Figtree: 'Figtree',
  'DM Sans': 'DM Sans',
  Roboto: 'Roboto',
  'Open Sans': 'Open Sans',
  Outfit: 'Outfit',
  Lexend: 'Lexend',
  Montserrat: 'Montserrat',
  Poppins: 'Poppins',
  'Space Grotesk': 'Space Grotesk',
  'Bricolage Grotesque': 'Bricolage Grotesque',
  Syne: 'Syne',
  Epilogue: 'Epilogue',
  'Cabinet Grotesk': 'Cabinet Grotesk',
  'Albert Sans': 'Albert Sans',
  'Instrument Serif': 'Instrument Serif',
  'Playfair Display': 'Playfair Display',
  'DM Serif Display': 'DM Serif Display',
  Fraunces: 'Fraunces',
  Merriweather: 'Merriweather',
  Newsreader: 'Newsreader',
  'Bodoni Moda': 'Bodoni Moda',
  Lora: 'Lora',
  'JetBrains Mono': 'JetBrains Mono',
  'Fira Code': 'Fira Code',
  'Geist Mono': 'Geist Mono',
  'Space Mono': 'Space Mono',
  'IBM Plex Mono': 'IBM Plex Mono',
  'Source Code Pro': 'Source Code Pro',
};

const WEIGHT_OPTIONS: Record<number, string> = {
  300: '300 - Light',
  400: '400 - Regular',
  500: '500 - Medium',
  600: '600 - Semi Bold',
  700: '700 - Bold',
  800: '800 - Extra Bold',
};

const BASE_COLOR_FIELDS: Array<{
  key: keyof Pick<
    ColorPalette,
    | 'colorBackground'
    | 'colorSurface'
    | 'colorBorder'
    | 'colorTextPrimary'
    | 'colorTextSecondary'
  >;
  label: string;
}> = [
  { key: 'colorBackground', label: 'Background' },
  { key: 'colorSurface', label: 'Surface' },
  { key: 'colorBorder', label: 'Border' },
  { key: 'colorTextPrimary', label: 'Primary Text' },
  { key: 'colorTextSecondary', label: 'Secondary Text' },
];

const COLOR_PAIR_FIELDS: Array<{
  title: string;
  bgKey: keyof Pick<
    ColorPalette,
    'colorPrimary' | 'colorSecondary' | 'colorAccent'
  >;
  fgKey: keyof Pick<
    ColorPalette,
    | 'colorPrimaryForeground'
    | 'colorSecondaryForeground'
    | 'colorAccentForeground'
  >;
}> = [
  {
    title: 'Primary',
    bgKey: 'colorPrimary',
    fgKey: 'colorPrimaryForeground',
  },
  {
    title: 'Secondary',
    bgKey: 'colorSecondary',
    fgKey: 'colorSecondaryForeground',
  },
  {
    title: 'Accent',
    bgKey: 'colorAccent',
    fgKey: 'colorAccentForeground',
  },
];

const StorefrontPage: NextPageWithLayout = () => {
  const {
    currentRelease,
    storefront,
    updateColorPalette,
    updateTypography,
    saveThemeSettings,
    hasUnsavedThemeChanges,
  } = useVendorStorefrontContext();

  const colorPalette = useMemo(
    () => currentRelease?.themeSettings.colorPalette ?? DEFAULT_COLOR_PALETTE,
    [currentRelease],
  );
  const typography = useMemo(
    () => currentRelease?.themeSettings.typography ?? DEFAULT_TYPOGRAPHY,
    [currentRelease],
  );

  const updateColor = <K extends keyof ColorPalette>(
    key: K,
    value: ColorPalette[K],
  ) => {
    updateColorPalette(key, value);
  };

  const handleTypographyChange = <K extends keyof Typography>(
    key: K,
    value: Typography[K],
  ) => {
    updateTypography(key, value);
  };

  const pageSlug = 'home';

  return (
    <div className='grid min-h-full grid-cols-1 lg:grid-cols-[1fr_400px]'>
      {/* Main content: live theme preview */}
      <div className='p-6 lg:p-10'>
        {storefront && currentRelease ? (
          <StorefrontReleasePreview
            currentRelease={currentRelease}
            brand={storefront.brand}
            pageSlug={pageSlug}
          />
        ) : null}
      </div>

      {/* Right sidebar: Color Palette & Typography */}
      <aside className='divide-y divide-zinc-200 border-t border-zinc-200 bg-white lg:border-t-0 lg:border-l'>
        <section id='color-palette' className='flex flex-col gap-5 p-5'>
          <div>
            <h2 className='text-sm font-semibold text-zinc-900'>
              Color Palette
            </h2>
            <p className='mt-0.5 text-xs text-zinc-500'>
              Configure your storefront surfaces, text, and brand colors.
            </p>
          </div>

          <div className='flex flex-col gap-3'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
              Surfaces &amp; Text
            </span>
            <div className='grid grid-cols-1 gap-3'>
              {BASE_COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className='flex flex-col gap-1.5'>
                  <ConfigLabel label={label} forId={key} />
                  <ConfigInput
                    id={key}
                    name={key}
                    inputType='color'
                    currentValue={colorPalette[key]}
                    onValueChange={(val) => updateColor(key, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
              Brand &amp; Contrast Pairs
            </span>
            <div className='flex flex-col gap-3'>
              {COLOR_PAIR_FIELDS.map(({ title, bgKey, fgKey }) => (
                <div
                  key={title}
                  className='grid grid-cols-2 gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3'
                >
                  <div className='flex flex-col items-start gap-1.5'>
                    <ConfigLabel label={title} forId={bgKey} />
                    <ConfigInput
                      id={bgKey}
                      name={bgKey}
                      inputType='color'
                      currentValue={colorPalette[bgKey]}
                      onValueChange={(val) => updateColor(bgKey, val)}
                    />
                  </div>
                  <div className='flex flex-col items-start gap-1.5'>
                    <ConfigLabel label={`${title} Text`} forId={fgKey} />
                    <ConfigInput
                      id={fgKey}
                      name={fgKey}
                      inputType='color'
                      currentValue={colorPalette[fgKey]}
                      onValueChange={(val) => updateColor(fgKey, val)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id='typography' className='flex flex-col gap-5 p-5'>
          <div>
            <h2 className='text-sm font-semibold text-zinc-900'>Typography</h2>
            <p className='mt-0.5 text-xs text-zinc-500'>
              Set font families, weights, line heights, and letter spacing.
            </p>
          </div>

          {/* Headings */}
          <div className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
              Headings
            </span>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Font Family' forId='headingFont' />
              <ConfigInput
                id='headingFont'
                name='headingFont'
                inputType='select'
                selectOptions={FONT_OPTIONS}
                currentValue={typography.headingFont}
                onValueChange={(val) =>
                  handleTypographyChange('headingFont', String(val) as FontType)
                }
              />
            </div>

            <div className='grid grid-cols-2 gap-2.5'>
              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Weight' forId='headingWeight' />
                <ConfigInput
                  id='headingWeight'
                  name='headingWeight'
                  inputType='select'
                  selectOptions={WEIGHT_OPTIONS}
                  currentValue={typography.headingWeight}
                  onValueChange={(val) =>
                    handleTypographyChange('headingWeight', Number(val))
                  }
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Line Height' forId='headingLineHeight' />
                <ConfigInput
                  id='headingLineHeight'
                  name='headingLineHeight'
                  inputType='number'
                  min={0.8}
                  max={2.5}
                  step={0.05}
                  currentValue={typography.headingLineHeight}
                  onValueChange={(val) =>
                    handleTypographyChange('headingLineHeight', val)
                  }
                />
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel
                label='Letter Spacing'
                forId='headingLetterSpacing'
              />
              <ConfigInput
                id='headingLetterSpacing'
                name='headingLetterSpacing'
                inputType='number'
                min={-0.1}
                max={0.5}
                step={0.01}
                suffix='em'
                currentValue={typography.headingLetterSpacing}
                onValueChange={(val) =>
                  handleTypographyChange('headingLetterSpacing', val)
                }
              />
            </div>
          </div>

          {/* Body */}
          <div className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5'>
            <span className='text-[11px] font-semibold uppercase tracking-wider text-zinc-500'>
              Body
            </span>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Font Family' forId='bodyFont' />
              <ConfigInput
                id='bodyFont'
                name='bodyFont'
                inputType='select'
                selectOptions={FONT_OPTIONS}
                currentValue={typography.bodyFont}
                onValueChange={(val) =>
                  handleTypographyChange('bodyFont', String(val) as FontType)
                }
              />
            </div>

            <div className='grid grid-cols-2 gap-2.5'>
              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Weight' forId='bodyWeight' />
                <ConfigInput
                  id='bodyWeight'
                  name='bodyWeight'
                  inputType='select'
                  selectOptions={WEIGHT_OPTIONS}
                  currentValue={typography.bodyWeight}
                  onValueChange={(val) =>
                    handleTypographyChange('bodyWeight', Number(val))
                  }
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Line Height' forId='bodyLineHeight' />
                <ConfigInput
                  id='bodyLineHeight'
                  name='bodyLineHeight'
                  inputType='number'
                  min={1}
                  max={2.5}
                  step={0.05}
                  currentValue={typography.bodyLineHeight}
                  onValueChange={(val) =>
                    handleTypographyChange('bodyLineHeight', val)
                  }
                />
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Letter Spacing' forId='bodyLetterSpacing' />
              <ConfigInput
                id='bodyLetterSpacing'
                name='bodyLetterSpacing'
                inputType='number'
                min={-0.1}
                max={0.5}
                step={0.01}
                suffix='em'
                currentValue={typography.bodyLetterSpacing}
                onValueChange={(val) =>
                  handleTypographyChange('bodyLetterSpacing', val)
                }
              />
            </div>
          </div>
        </section>

        {/* Floating Save Popup */}
        <div className='sticky bottom-4 z-30 mx-4 mb-4 flex items-center justify-between gap-3 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur'>
          <span className='pl-1.5 text-xs text-zinc-500'>
            {hasUnsavedThemeChanges
              ? 'Unsaved theme changes'
              : 'All changes saved'}
          </span>
          <SaveButton
            onSave={saveThemeSettings}
            disabled={!hasUnsavedThemeChanges}
          />
        </div>
      </aside>
    </div>
  );
};

StorefrontPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default StorefrontPage;
