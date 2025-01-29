import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
// Only import this type, will not be part of the bundle

/**
 * Push an event to the GTM DataLayer
 *
 * @param eventName
 * @param optionalVariables
 */
export const dataLayerEvent = (eventName: string, optionalVariables = {}) => {
   dataLayerWrapper({
      event: eventName,
      ...optionalVariables,
   })

   analyticsTrack(eventName, optionalVariables)
}

/**
 * Set user variables on DataLayer
 * @param userData
 */
export const dataLayerUser = (userData: UserData) => {
   if (!userData) return

   dataLayerWrapper({
      user_id: userData.authId,
      isAdmin: userData.isAdmin === true,
   })

   analyticsIdentify(userData.authId)
}

const dataLayerWrapper = (event: object) => {
   if (typeof window === "undefined") return

   try {
      window["dataLayer"].push(event)
   } catch (e) {
      console.error(e)
   }
}

/**
 * Data layer event that receives a livestream object and sends extra metadata as variables
 * @param eventName
 * @param livestream
 * @param optionalVariables
 */
export const dataLayerLivestreamEvent = (
   eventName: string,
   livestream: LivestreamEvent,
   optionalVariables = {}
) => {
   dataLayerEvent(
      eventName,
      Object.assign(
         {},
         {
            livestreamId: livestream?.id,
            livestreamTitle: livestream?.title,
         },
         optionalVariables
      )
   )
}

/**
 * Track a page view
 * @param category Optional category of the page
 * @param name Optional name of the page
 * @param properties Optional additional properties
 */
export const analyticsPage = (
   category?: string,
   name?: string,
   properties: Record<string, any> = {}
) => {
   if (typeof window === "undefined") return

   window.analytics.push([
      "page",
      category, // optional
      name, // optional
      properties, // optional
   ])
}

/**
 * Track an event
 * @param eventName Name of the event
 * @param properties Optional properties for the event
 */
export const analyticsTrack = (
   eventName: string,
   properties: Record<string, any> = {}
) => {
   if (typeof window === "undefined") return

   window.analytics.push(["track", eventName, properties])
}

export const analyticsIdentify = (userId: string) => {
   if (typeof window === "undefined") return

   window.analytics.push(["identify", userId])
}

declare global {
   interface Window {
      analytics: any[]
      dataLayer: any[]
   }
}
