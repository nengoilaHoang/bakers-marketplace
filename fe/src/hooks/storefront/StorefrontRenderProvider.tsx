import StorefrontRenderContext, {
  StorefrontRenderContextValue,
} from './StorefrontRenderContext';

const StorefrontRenderProvider = ({
  value,
  children,
}: {
  value: StorefrontRenderContextValue;
  children: React.ReactNode;
}) => {
  return (
    <StorefrontRenderContext.Provider value={value}>
      {children}
    </StorefrontRenderContext.Provider>
  );
};
export default StorefrontRenderProvider;
