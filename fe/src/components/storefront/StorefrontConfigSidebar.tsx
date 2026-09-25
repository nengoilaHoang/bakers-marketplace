import useStorefrontCanvasContext from "@/hooks/storefront/useStorefrontCanvasContext";
import useStorefrontContext from "@/hooks/storefront/useStorefrontContext";
import ConfigSidebar from "./ConfigSidebar";

const StorefrontConfigSidebar = () => {
  const { state, updateConfig } = useStorefrontContext();
  const { selectedComponentId } = useStorefrontCanvasContext();

  const selectedComponent = selectedComponentId
    ? state.components[selectedComponentId]
    : null;

  if (!selectedComponent) return null;

  return (
    <ConfigSidebar
      key={selectedComponent.id}
      config={selectedComponent.config}
      onUpdate={(config) => updateConfig(selectedComponent.id, config)}
    ></ConfigSidebar>
  );
};

export default StorefrontConfigSidebar;
