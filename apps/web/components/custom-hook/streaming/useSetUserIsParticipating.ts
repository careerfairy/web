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
