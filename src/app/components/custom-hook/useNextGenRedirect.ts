import { useEffect } from "react";

const useNextGenRedirect = (isBeta: boolean) => {
   useEffect(() => {
      const isInProdEnvironment = process.env.NODE_ENV === "production";
      const { host, pathname, search: query } = window.location;

      const isInBetaDomain = host === "nextgen.careerfairy.io";

      if (!isInProdEnvironment || typeof isBeta !== "boolean") return;
      if (isBeta) {
         if (!isInBetaDomain) {
            window.location.href = `https://nextgen.careerfairy.io${pathname}${query}`;
         }
      } else {
         if (isInBetaDomain) {
            window.location.href = `https://careerfairy.io${pathname}${query}`;
         }
      }
   }, [isBeta]);

   return null;
};

export default useNextGenRedirect;
