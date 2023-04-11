import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"
import { userRepo } from "data/RepositoryInstances"

/**
 * Interval to update the user lastActivityAt field
 *
 * This is to reduce to number of writes, we don't need to update
 * the user activity on every page refresh
 */
const MIN_UPDATE_INTERVAL_MS = 10_800_000 // 3h

/**
 * Update the user last activity at least every $MIN_UPDATE_INTERVAL_MS
 *
 * Also creates a user tokenRefresh activity on the activities subcollection
 *
 * Generates less activities for admin users
 */
export const updateUserActivity = async (user: UserData) => {
   if (!user?.lastActivityAt) {
      // every user should have the lastActivityAt field
      return
   }

   const now = Date.now()
   let diff = Math.abs(now - user.lastActivityAt.toMillis())

   // Relax updates for admins, they are not real users
   // and we don't want to spam the db with their activity
   if (user.isAdmin) {
      diff /= 3 // updates every MIN_UPDATE_INTERVAL_MS * 3 (9h)
   }

   if (diff < MIN_UPDATE_INTERVAL_MS) {
      // no need to update yet
      return
   }

   await userRepo.createActivity(pickPublicDataFromUser(user), "tokenRefresh")
}
