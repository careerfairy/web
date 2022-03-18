export const mainProductionDomain = "careerfairy.io";

export const getHost = () => {
   if (typeof window !== "undefined") {
      return window.location.origin;
   }

   return mainProductionDomain;
};
