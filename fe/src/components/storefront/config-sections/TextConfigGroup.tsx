import { TextAlignmentType, TextConfig } from '@/types/layout-component';
import ConfigInput from './ConfigInput';
import ConfigLabel from './ConfigLabel';

export type TextConfigItem = {
  value: string;
} & TextConfig;

export const DEFAULT_TEXT_CONFIG: TextConfigItem = {
  value: '',
  textColor: '#000000',
  textAlign: 'left',
  fontWeight: 400,
  fontStyle: 'normal',
  decoration: 'none',
};

const QUICK_PALETTE = [
  '#000000',
  '#18181B',
  '#27272A',
  '#52525B',
  '#FFFFFF',
  '#B91C1C',
];

const TEXT_ALIGN_OPTIONS: Record<TextAlignmentType, string> = {
  left: 'Left',
  center: 'Center',
  right: 'Right',
  justify: 'Justify',
};

const FONT_WEIGHT_OPTIONS = {
  normal: 'Normal',
  'semi-bold': 'Semi Bold',
  bold: 'Bold',
  'extra-bold': 'Extra Bold',
} as const;

const FONT_STYLE_OPTIONS = {
  normal: 'Normal',
  italic: 'Italic',
  oblique: 'Oblique',
} as const;

const DECORATION_OPTIONS = {
  none: 'None',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
} as const;

export interface TextConfigGroupProps {
  label: string;
  fieldPrefix: string;
  item: TextConfigItem;
  defaultColor?: string;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
}

const TextConfigGroup = ({
  label,
  fieldPrefix,
  item,
  defaultColor = '#000000',
  onUpdate,
  onActiveSectionChange,
}: TextConfigGroupProps) => {
  return (
    <div className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'>
      <span className='text-xs font-semibold text-zinc-800 uppercase tracking-wide'>
        {label}
      </span>

      {/* 1. Text Content Value */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Text' forId={`${fieldPrefix}-text`} />
        <ConfigInput
          id={`${fieldPrefix}-text`}
          name={`${fieldPrefix}.value`}
          inputType='text'
          currentValue={item.value}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.value`, val)}
        />
      </div>

      {/* 2. Text Color */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Color' forId={`${fieldPrefix}-color`} />
        <ConfigInput
          id={`${fieldPrefix}-color`}
          name={`${fieldPrefix}.textColor`}
          inputType='color'
          presets={QUICK_PALETTE}
          currentValue={item.textColor ?? defaultColor}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.textColor`, val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 3. Align & Style */}
      <div className='grid grid-cols-2 gap-2'>
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Align' forId={`${fieldPrefix}-align`} />
          <ConfigInput
            id={`${fieldPrefix}-align`}
            name={`${fieldPrefix}.textAlign`}
            inputType='select'
            selectOptions={TEXT_ALIGN_OPTIONS}
            currentValue={item.textAlign ?? 'left'}
            onValueChange={(val) => onUpdate(`${fieldPrefix}.textAlign`, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Style' forId={`${fieldPrefix}-style`} />
          <ConfigInput
            id={`${fieldPrefix}-style`}
            name={`${fieldPrefix}.fontStyle`}
            inputType='select'
            selectOptions={FONT_STYLE_OPTIONS}
            currentValue={item.fontStyle ?? 'normal'}
            onValueChange={(val) => onUpdate(`${fieldPrefix}.fontStyle`, val)}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>
      </div>

      {/* 4. Text Decoration */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Decoration' forId={`${fieldPrefix}-decoration`} />
        <ConfigInput
          id={`${fieldPrefix}-decoration`}
          name={`${fieldPrefix}.decoration`}
          inputType='select'
          selectOptions={DECORATION_OPTIONS}
          currentValue={item.decoration ?? 'none'}
          onValueChange={(val) =>
            onUpdate(
              `${fieldPrefix}.decoration`,
              val === 'none' ? undefined : val,
            )
          }
          onOpenStateChange={onActiveSectionChange}
        />
      </div>

      {/* 5. Font Weight */}
      <div className='flex flex-col gap-1.5'>
        <ConfigLabel label='Weight' forId={`${fieldPrefix}-weight`} />
        <ConfigInput
          id={`${fieldPrefix}-weight`}
          name={`${fieldPrefix}.fontWeight`}
          inputType='select'
          selectOptions={FONT_WEIGHT_OPTIONS}
          currentValue={String(item.fontWeight ?? 'normal')}
          onValueChange={(val) => onUpdate(`${fieldPrefix}.fontWeight`, val)}
          onOpenStateChange={onActiveSectionChange}
        />
      </div>
    </div>
  );
};

export default TextConfigGroup;
