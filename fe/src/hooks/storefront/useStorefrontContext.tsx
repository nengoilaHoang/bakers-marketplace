import { useContext } from "react";
import StorefrontContext from "./StorefrontContext";

const useStorefrontContext = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error(
      "useStorefrontContext must be used within a StorefrontProvider",
    );
  }

  return context;
};

export default useStorefrontContext;
