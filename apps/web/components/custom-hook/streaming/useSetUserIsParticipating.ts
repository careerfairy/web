import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

const getKey = (
   livestreamId: string,
   userData: UserData,
   userStats: UserStats
) =>
   `set-user-participating-${JSON.stringify({
      livestreamId,
      user: {
         userEmail: userData?.userEmail,
         isAdmin: userData.isAdmin,
         linkedinUrl: userData.linkedinUrl,
         firstName: userData.firstName,
         lastName: userData.lastName,
         registeredGroups: userData.registeredGroups,
      },
      userStats,
   })}`

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
export const useSetUserIsParticipating = (
   livestreamId: string,
   userData: UserData,
   userStats: UserStats
) => {
   const key = getKey(livestreamId, userData, userStats)

   const fetcher = async () => {
      if (!userData) return
      return livestreamService.setUserIsParticipating(
         livestreamId,
         userData,
         userStats
      )
   }

   const { trigger } = useSWRMutation(key, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Failed to set user as participating",
            key,
         }),
   })

   return {
      setViewerIsParticipating: trigger,
      key,
   }
}
