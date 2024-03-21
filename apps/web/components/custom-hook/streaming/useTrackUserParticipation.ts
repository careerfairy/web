import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * A custom hook that utilizes the `setUserIsParticipating` method from `@LivestreamService.ts`.
 * This method updates Firestore to reflect a user's participation status in a livestream.
 * It sets user data and stats in the `userLivestreamData` collection and adds the user's email to the `participatingStudents` array of the livestream document.
 *
 * @param {string} livestreamId - The ID of the livestream.
 * @param {UserData} userData - The user's data.
 * @param {UserStats} userStats - The user's statistics.
 * @returns An object containing a function to trigger the participation status update and the mutation key.
 */
export const useTrackUserParticipation = (
   livestreamId: string,
   userData: UserData,
   userStats: UserStats
) => {
   const fetcher = async () =>
      livestreamService.setUserIsParticipating(
         livestreamId,
         userData,
         userStats
      )

   return useSWR(
      userData
         ? `set-user-${userData.userEmail}-participating-${livestreamId}`
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
