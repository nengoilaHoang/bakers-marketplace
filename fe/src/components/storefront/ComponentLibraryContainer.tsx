// components/storefront/StorefrontConfigSidebar.tsx
import { useCallback, useState } from 'react';
import ComponentLibrary from './ComponentLibrary';

const ComponentLibraryContainer = () => {
  const [openConfig, setOpenConfig] = useState(false);

  const handleToggleConfig = useCallback(
    () => setOpenConfig((prev) => !prev),
    [],
  );

  return (
    <ComponentLibrary isOpen={openConfig} toggleConfig={handleToggleConfig} />
  );
};

export default ComponentLibraryContainer;
