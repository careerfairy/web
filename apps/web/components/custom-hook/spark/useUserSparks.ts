import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { useAuth } from "HOCs/AuthProvider"
import { sparkService } from "data/firebase/SparksService"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const getKey = (userId: string) =>
   userId ? `userSparks-${userId}` : "userSparks"

/**
 * Custom hook to fetch user sparks.
 * Utilizes SWR for data fetching and caching.
 *
 * @returns SWR response object containing user sparks data.
 */
export const useUserSparks = () => {
   const { authenticatedUser } = useAuth()

   const key = authenticatedUser.isLoaded
      ? getKey(authenticatedUser.email)
      : null

   return useSWR(
      key,
      async () => {
         const { sparks } = await sparkService.fetchFeed({
            numberOfSparks: 10,
            userId: authenticatedUser.email || null,
         })

         return sparks.map(SparkPresenter.toFirebaseObject)
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error fetching user sparks",
               key,
            })
         },
      }
   )
}
