import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"
import { userServiceInstance } from "data/firebase/UserService"
import SessionStorageUtil from "util/SessionStorageUtil"

const SESSION_STORAGE_KEY = "lastActivityAt"

/**
 * Interval to update the user lastActivityAt field
 *
 * This is to reduce to number of writes, we don't need to update
 * the user activity on every page refresh
 */
const MIN_UPDATE_INTERVAL_MS = 3_600_000 // 1h

/**
 * Update the user last activity at least every hour
 * Inserts a key on sessionStorage to reduce the number of writes
 */
export const updateUserActivity = async (user: UserData) => {
   if (needsToBeUpdated()) {
      await userServiceInstance.createActivity(
         pickPublicDataFromUser(user),
         "tokenRefresh"
      )
      setLastUpdatedAt()
   }
}

/**
 * Checks if we need to update the user last activity
 * Only if the last update was more than MIN_UPDATE_INTERVAL_MS ago
 */
const needsToBeUpdated = () => {
   const lastUpdatedAt = getLastUpdatedAt()

   if (lastUpdatedAt) {
      if (Date.now() - lastUpdatedAt > MIN_UPDATE_INTERVAL_MS) {
         return true
      }
   } else {
      return true
   }

   return false
}

/**
 * Get the epoch ms stored in the sessions storage
 */
const getLastUpdatedAt = (): number | null => {
   let lastUpdatedAt = SessionStorageUtil.get(SESSION_STORAGE_KEY)

   if (!lastUpdatedAt) {
      return null
   }

   try {
      return parseInt(lastUpdatedAt)
   } catch (error) {
      console.error(error)
      return null
   }
}

const setLastUpdatedAt = () => {
   SessionStorageUtil.set(SESSION_STORAGE_KEY, Date.now())
}
