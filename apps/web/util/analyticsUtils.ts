import TagManager from "react-gtm-module"
import { UserData } from "@careerfairy/shared-lib/dist/users"

/**
 * Push an event to the GTM DataLayer
 *
 * @param eventName
 * @param optionalVariables
 */
export const dataLayerEvent = (eventName: string, optionalVariables = {}) => {
   TagManager.dataLayer({
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

   TagManager.dataLayer({
      dataLayer: {
         user_id: userData.authId,
         isAdmin: userData.isAdmin === true,
      },
   })
}
