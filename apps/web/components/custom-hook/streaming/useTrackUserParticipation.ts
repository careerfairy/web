import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * A custom hook that utilizes the `setUserIsParticipating` method from `@LivestreamService.ts`.
 * This method updates Firestore to reflect a user's participation status in a livestream.
 * It sets user data and stats in the `userLivestreamData` collection.
 *
 * @param {LivestreamEvent} livestream - The livestream.
 * @param {UserData} userData - The user's data.
 * @param {UserStats} userStats - The user's statistics.
 * @returns An object containing a function to trigger the participation status update and the mutation key.
 */
export const useTrackUserParticipation = (
   livestream: LivestreamEvent,
   userData: UserData,
   userStats: UserStats
) => {
   const fetcher = async () =>
      livestreamService
         .setUserIsParticipating(livestream.id, userData, userStats)
         .then(() => {
            dataLayerLivestreamEvent(AnalyticsEvents.AttendEvent, livestream)
         })

   return useSWR(
      userData && livestream
         ? `set-user-${userData.userEmail}-participating-${livestream.id}`
         : null,
      fetcher,
      {
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: "Failed to set user as participating",
               key,
            }),
      }
   )
}
