import TagManager from "react-gtm-module"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { errorLogAndNotify } from "./CommonUtil"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

/**
 * Push an event to the GTM DataLayer
 *
 * @param eventName
 * @param optionalVariables
 */
export const dataLayerEvent = (eventName: string, optionalVariables = {}) => {
   dataLayerWrapper({
      dataLayer: {
         event: eventName,
         ...optionalVariables,
      },
   })
}

/**
 * Set user variables on DataLayer
 * @param userData
 */
export const dataLayerUser = (userData: UserData) => {
   if (!userData) return

   dataLayerWrapper({
      dataLayer: {
         user_id: userData.authId,
         isAdmin: userData.isAdmin === true,
      },
   })
}

const dataLayerWrapper = (...args) => {
   try {
      TagManager.dataLayer(...args)
   } catch (e) {
      errorLogAndNotify(e)
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
