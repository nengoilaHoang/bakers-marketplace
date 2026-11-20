// components/storefront/SaveLayoutButton.tsx
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { ApiError } from '@/lib/api';
import { useEffect, useState } from 'react';

type SaveButtonProps = {
  onSave: () => void | Promise<void>;
  disabled: boolean;
};

const SaveButton = ({ onSave, disabled }: SaveButtonProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [saveDone, setSaveDone] = useState(true);

  useEffect(() => {
    if (saveDone) return;
    const timeout = setTimeout(() => {
      setSaveDone(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [saveDone]);

  let saveButtonLabel = 'Saved';

  if (isSaving) {
    saveButtonLabel = 'Saving...';
  } else if (!disabled) {
    saveButtonLabel = 'Save';
  }

  const handleSave = async () => {
    setErrorMessage(null);
    setSaveDone(false);

    try {
      setIsSaving(true);
      await onSave();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Failed to save layout changes.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex items-center gap-3'>
      {errorMessage && (
        <span role='alert' className='text-xs font-medium text-danger'>
          {errorMessage}
        </span>
      )}
      <Button
        type='button'
        size='sm'
        variant='primary'
        disabled={disabled || isSaving}
        onClick={() => void handleSave()}
      >
        {!saveDone && (
          <Icon
            name={isSaving ? 'refresh' : 'circle-check'}
            className={`size-4 ${isSaving ? 'animate-spin' : ''}`}
          />
        )}
        {saveButtonLabel}
      </Button>
    </div>
  );
};

export default SaveButton;
