import TagManager from "react-gtm-module"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { errorLogAndNotify } from "./CommonUtil"

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
