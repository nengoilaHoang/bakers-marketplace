// components/storefront/StorefrontConfigSidebar.tsx
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { useCallback, useState } from 'react';
import ComponentInspector from './ComponentInspector';

const ComponentInspectorContainer = () => {
  const { state, updateConfig } = useStorefrontLayoutContext();
  const { selectedComponentId } = useStorefrontCanvasContext();
  const [openConfig, setOpenConfig] = useState(true);

  const selectedComponent = selectedComponentId
    ? state.components[selectedComponentId]
    : null;

  const handleUpdate = useCallback(
    (pathname: string, value: unknown, bp?: string) => {
      if (selectedComponentId === null) return;
      updateConfig(selectedComponentId, pathname, value, bp);
    },
    [selectedComponentId, updateConfig],
  );

  const handleToggleConfig = useCallback(
    () => setOpenConfig((prev) => !prev),
    [],
  );

  if (!selectedComponent) return null;

  return (
    <ComponentInspector
      key={selectedComponent.id}
      isOpen={openConfig}
      toggleConfig={handleToggleConfig}
      component={selectedComponent}
      onUpdate={handleUpdate}
    />
  );
};

export default ComponentInspectorContainer;
