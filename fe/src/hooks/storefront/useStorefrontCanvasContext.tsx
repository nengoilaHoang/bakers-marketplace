import { useContext } from "react";
import StorefrontCanvasContext from "./StorefrontCanvasContext";

const useStorefrontCanvasContext = () => {
  const context = useContext(StorefrontCanvasContext);
  if (!context) {
    throw new Error(
      "useStorefrontCanvas must be used within a StorefrontCanvasProvider",
    );
  }

  return context;
};

export default useStorefrontCanvasContext;
