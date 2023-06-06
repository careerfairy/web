export const mainProductionDomain = "careerfairy.io"
export const mainProductionDomainWithProtocol = `https://${mainProductionDomain}`

/**
 *  Utility function that returns the current host name (domain)
 *
 * If the code is running in the browser, it will return the window.location.origin value.
 * Otherwise, it will return the mainProductionDomain.
 *
 * @returns The current host name as a string.
 */
export const getHost = (): string => {
   // If running in a browser, return the current page's host name.
   if (typeof window !== "undefined") {
      return window.location.origin
   }

   // If not in a browser, return the main production domain.
   return mainProductionDomainWithProtocol
}

type OptionsMakeLivestreamEventUrl = {
   section?: "portal" | "next-livestreams"
   relative?: boolean
}

/**
 * Creates a deep link for a live stream details page / dialog
 */
export const makeLivestreamEventDetailsUrl = (
   livestreamId: string,
   options: OptionsMakeLivestreamEventUrl = {}
) => {
   options = {
      section: "portal",
      relative: false,
      ...options,
   }

   let url: string = `/${options.section}/livestream/${livestreamId}`

   if (options.relative === false) {
      url = `${getHost()}${url}`
   }

   return url
}

/**
 * Creates a deep link for a live stream details inside a group
 */
export const makeLivestreamGroupEventDetailsUrl = (
   groupId: string,
   livestreamId: string
) => {
   return `${getHost()}/next-livestreams/group/${groupId}/livestream/${livestreamId}`
}
