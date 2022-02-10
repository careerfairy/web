import { useCallback } from "react";
import { useLocalStorage } from "react-use";

const useLocalProxyType = () => {
   const [
      storedProxyType,
      setStoredProxyType,
      clearStoredProxyType,
   ] = useLocalStorage<"strict" | "normal">("proxyType", undefined);

   const setProxyType = useCallback((strictMode?: boolean) => {
      if (strictMode) {
         setStoredProxyType("strict");
      } else {
         setStoredProxyType("normal");
      }
   }, []);

   return {
      clearStoredProxyType,
      setProxyType,
      storedProxyType,
   };
};

export default useLocalProxyType;
