import useVendorStorefrontContext from '@/hooks/storefront/useVendorStorefrontContext';
import { useMemo, useState } from 'react';
import TypeableSelect from './config-sections/inputs/TypeableSelect';

const ReleaseSelect = () => {
  const { storefront, currentRelease, setCurrentReleaseId } =
    useVendorStorefrontContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (value: string) => {
    setCurrentReleaseId(value);
  };

  const releaseOptions = useMemo(
    () =>
      Object.fromEntries(
        (storefront?.releases || []).map((rel) => [
          rel.id,
          `v${rel.version} - ${rel.displayName}`,
        ]),
      ),
    [storefront?.releases],
  );

  if (!storefront || !currentRelease) return null;

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
        currentValue={currentRelease.id}
        options={releaseOptions}
        onOpenChange={setIsOpen}
        isTypeable={false}
        showKeyValue={false}
      ></TypeableSelect>
    </div>
  );
};

export default ReleaseSelect;
