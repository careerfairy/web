import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"
import { UserPublicData } from "../users"
import { round } from "../utils"
import { LivestreamEventPublicData } from "./livestreams"

/**
 * Livestream Popularity events
 */
export const PopularityEventTypes = {
   SUCCESSFULLY_REGISTERED_TO_EVENT: 2,
   SUCCESSFULLY_REGISTERED_TO_EVENT_FROM_SHARED_LINK: 3, // If there's a LocalStorageUtil.getReferralCode()
   CREATED_QUESTION: 3,
   UPVOTED_QUESTION: 1,
   JOINED_TALENT_POOL: 2,
   VISITED_DETAIL_PAGE: 1,
   // Same as above but we only consider it a shared link if there's a LocalStorageUtil.getReferralCode()
   VISITED_DETAIL_PAGE_FROM_SHARED_LINK: 2,
} as const

export type PopularityEventType = keyof typeof PopularityEventTypes

export const getPopularityPoints = (doc: PopularityEventData) => {
   let points = PopularityEventTypes[doc.type]

   let multiplier = 1
   if (doc.livestream.hasJobs) {
      multiplier += 0.2
   }

   return round(points * multiplier, 2)
}

/**
 * Firestore type for Popularity Events doc
 */
export interface PopularityEventData extends Identifiable {
   type: PopularityEventType

   createdAt: Timestamp

   // some events aren't associated to a user
   // e.g page visits
   userId?: string
   user?: UserPublicData

   livestreamId: string
   livestream: LivestreamEventPublicData

   /**
    * Total points to be added to the popularity field
    * (includes multiplier bonus)
    */
   points: number
}
