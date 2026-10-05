import useVendorContext from '@/hooks/storefront/useVendorContext';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import TypeableSelect from './config-sections/TypeableSelect';

const ReleaseSelect = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentStorefront, setCurrentReleaseId } = useVendorContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (value: string) => {
    setCurrentReleaseId(value);
  };

  const releaseOptions = useMemo(
    () =>
      Object.fromEntries(
        (currentStorefront?.releases || []).map((rel) => [
          `v${rel.version} - ${rel.displayName}`,
          rel.id,
        ]),
      ),
    [currentStorefront?.releases],
  );

  if (!currentStorefront) return null;

  return (
    <div className='flex items-center gap-2'>
      <label
        htmlFor='release-selector'
        className='text-sm font-semibold uppercase text-zinc-500'
      >
        Release:
      </label>
      <TypeableSelect
        id='release-selector'
        name='releaseId'
        isOpen={isOpen}
        onValueChange={handleChange}
        currentValue={id as string}
        options={releaseOptions}
        onOpenChange={setIsOpen}
        isTypeable={false}
      ></TypeableSelect>
    </div>
  );
};

export default ReleaseSelect;
