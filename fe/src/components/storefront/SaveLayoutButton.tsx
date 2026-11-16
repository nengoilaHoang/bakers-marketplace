// components/storefront/SaveLayoutButton.tsx
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { ApiError } from '@/lib/api';
import { useEffect, useState } from 'react';

const SaveLayoutButton = () => {
  const { hasUnsavedChanges, isSaving, saveLayout } =
    useStorefrontLayoutContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  } else if (hasUnsavedChanges) {
    saveButtonLabel = 'Save changes';
  }

  const handleSave = async () => {
    setErrorMessage(null);
    setSaveDone(false);

    try {
      await saveLayout();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Failed to save layout changes.',
      );
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
        disabled={!hasUnsavedChanges || isSaving}
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

export default SaveLayoutButton;
