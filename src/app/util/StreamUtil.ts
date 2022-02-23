import { mainProductionDomain, nextGenSubDomain } from "../constants/domains";

export const shouldWeRedirectNextGen = (
   currentHost: string,
   currentEnv: string,
   livestreamIsBeta: boolean,
   requestDetails: string
) => {
   const isInProdEnvironment = currentEnv === "production";

   const isInNextGenSubDomain = currentHost === nextGenSubDomain;
   const isBeta = livestreamIsBeta;
   // if we should redirect, we return a string with the URL to redirect

   if (!isInProdEnvironment || typeof isBeta !== "boolean") {
      return null;
   }
   if (isBeta) {
      if (!isInNextGenSubDomain) {
         return `https://${nextGenSubDomain}${requestDetails}`;
      }
   } else {
      if (isInNextGenSubDomain) {
         return `https://${mainProductionDomain}${requestDetails}`;
      }
   }

   // we don't need to redirect
   return null;
};
