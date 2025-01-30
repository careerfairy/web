import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"

// Only import types, will not be part of the bundle, real package is loaded by GTM
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
 * Before you continue, please read the following:
 * 1. We queue analytics events in window["analytics"] array before Customer.io script loads.
 * 2. Once Customer.io script loads, it will automatically process any queued/incoming events.
 */

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

/**
 * 1. Associate a user with an anonymous id if it exists
 
 * @param userAuthId the user auth id
 */
export const analyticsLogin = async (userAuthId: string) => {
   if (typeof window === "undefined") return

   // Link anonymous user's activity to their new account after login
   if (typeof window["analytics"] !== "undefined") {
      const anonymousId = window["analytics"].user().anonymousId()

      if (anonymousId) {
         window["analytics"].alias(anonymousId, userAuthId)
      }
   }

   window["analytics"].push(["identify", userAuthId])
}

/**
 * Remove the logged in user from the analytics
 */
export const analyticsUserLogout = async () => {
   if (typeof window === "undefined") return

   window["analytics"].push(["reset"])
}

type GroupTraitOptions = GroupTraits & {
   /**
    * The type of association to the group, must be an incrementing number
    * 1 = User Follows Company
    * 2 = User Registered to Livestream
    * 3 = User Participates in Livestream
    */
   objectTypeId: 1 | 2 | 3
}

/**
 * Associates an existing user with a group
 * @param id the group id
 * @param traits the group traits
 */
export const analyticsAssociateUserToGroup = (
   id: string,
   traits: GroupTraitOptions
) => {
   if (typeof window === "undefined") return

   window["analytics"].push(["group", id, traits])
}

/**
 * Removes an existing user association from a group
 * @param id the group id
 * @param options the group options
 */
export const analyticsRemoveUserAssociationFromGroup = (
   id: string,
   options: {
      objectTypeId: number
      objectId: string
   }
) => {
   if (typeof window === "undefined") return

   window["analytics"].push(["track", "Delete Relationship", options])
}
