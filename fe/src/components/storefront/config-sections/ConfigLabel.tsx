import { cn } from '@/lib/cn';

type ConfigLabelProps = {
  label: string;
  forId: string;
  className?: string;
};

const ConfigLabel = ({ label, forId, className }: ConfigLabelProps) => {
  return (
    <label
      className={cn(
        'shrink-0 min-w-0 text-[11px] font-medium text-ink capitalize',
        className,
      )}
      htmlFor={forId}
    >
      {label}
    </label>
  );
};

export default ConfigLabel;
