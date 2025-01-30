import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
// Only import this type, will not be part of the bundle
import { type GroupTraits } from "@customerio/cdp-analytics-browser"

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

   analyticsTrackEvent(eventName, optionalVariables)
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
 * Track a page view in analytics
 *
 * Customer.io captures everything automatically when using the JavaScript source.
 * This includes page events with the page URL and other common properties.
 */
export const analyticsPage = () => {
   if (typeof window === "undefined") return

   window["analytics"].push(["page"])
}

/**
 * Track an event
 * @param eventName Name of the event
 * @param properties Optional properties for the event
 */
export const analyticsTrackEvent = (
   eventName: string,
   properties: Record<string, any> = {}
) => {
   if (typeof window === "undefined") return

   window["analytics"].push(["track", eventName, properties])
}

export const group = (id: string, traits: GroupTraits) => {
   if (typeof window === "undefined") return

   window["analytics"].push(["group", id, traits])
}

export const analyticsLogin = async (userAuthId: string) => {
   if (typeof window === "undefined") return

   // If the analytics object is already initialized, we need to alias the anonymous id to the userAuthId
   if (typeof window["analytics"] !== "undefined") {
      const previousId = window["analytics"].user().anonymousId()

      if (previousId) {
         window["analytics"].alias(previousId, userAuthId)
      }
   }

   window["analytics"].push(["identify", userAuthId])
}

export const analyticsUserLogout = async () => {
   if (typeof window === "undefined") return

   window["analytics"].push(["reset"])
}
