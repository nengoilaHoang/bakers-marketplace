import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { useCallback, useState } from 'react';
import ConfigSidebar from './ConfigSidebar';

const StorefrontConfigSidebar = () => {
  const { state, updateConfig } = useStorefrontLayoutContext();
  const { selectedComponentId } = useStorefrontCanvasContext();
  const [openConfig, setOpenConfig] = useState(false);

  const selectedComponent = selectedComponentId
    ? state.components[selectedComponentId]
    : null;

  const handleUpdate = useCallback(
    (pathname: string, value: unknown) => {
      if (selectedComponentId === null) return;
      updateConfig(selectedComponentId, pathname, value);
    },
    [selectedComponentId, updateConfig],
  );

  const handleToggleConfig = useCallback(
    () => setOpenConfig((prev) => !prev),
    [],
  );

  if (!selectedComponent) {
    setOpenConfig(false);
    return null;
  }

  return (
    <ConfigSidebar
      isOpen={openConfig}
      toggleConfig={handleToggleConfig}
      key={selectedComponent.id}
      config={selectedComponent.config}
      onUpdate={handleUpdate}
    ></ConfigSidebar>
  );
};

export default StorefrontConfigSidebar;
