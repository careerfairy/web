import { NetworkerBadge } from "@careerfairy/shared-lib/dist/badges"
import { userAddEntryToArrayField } from "./user"
import functions = require("firebase-functions")

/**
 * Applies user badges
 */
export const handleUserBadges = async (
   userDataId: string,
   previousValue: any,
   newValue: any
): Promise<void> => {
   if (!newValue.referralsCount) {
      return
   }

   // Networker badge
   if (!newValue.badges?.includes(NetworkerBadge.key)) {
      if (newValue.referralsCount >= 3) {
         // add upper limit when having more badges
         await userAddEntryToArrayField(
            userDataId,
            "badges",
            NetworkerBadge.key
         )
         functions.logger.log(
            `Added the ${NetworkerBadge.key} badge to the user ${userDataId}!`
         )
      }
   }
}
