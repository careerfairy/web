export const mainProductionDomain = "careerfairy.io"
export const mainProductionDomainWithProtocol = `https://${mainProductionDomain}`

export const getHost = () => {
   if (typeof window !== "undefined") {
      return window.location.origin
   }

   return mainProductionDomain
}
