import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { useAuth } from "HOCs/AuthProvider"
import { sparkService } from "data/firebase/SparksService"
import { useEffect } from "react"
import useSWR, { preload } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const getKey = (userId: string) =>
   userId ? `userSparks-${userId}` : "userSparks"

const fetcher = async (userId?: string) => {
   const { sparks } = await sparkService.fetchFeed({
      numberOfSparks: 10,
      userId: userId || null,
   })
   return sparks.map(SparkPresenter.toFirebaseObject)
}

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

   return useSWR(key, async () => fetcher(authenticatedUser.email), {
      ...reducedRemoteCallsOptions,
      onError: (error, key) => {
         errorLogAndNotify(error, {
            message: "Error fetching user sparks",
            key,
         })
      },
   })
}

export const usePrefetchUserSparks = () => {
   const { authenticatedUser } = useAuth()

   useEffect(() => {
      // Only preload if the auth state has loaded
      if (authenticatedUser.isLoaded) {
         preload(getKey(authenticatedUser.email), async () =>
            fetcher(authenticatedUser.email)
         )
      }
   }, [authenticatedUser.email, authenticatedUser.isLoaded])

   return null
}
