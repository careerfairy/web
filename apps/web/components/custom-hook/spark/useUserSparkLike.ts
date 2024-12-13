import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { sparkService } from "data/firebase/SparksService"
import { useMemo } from "react"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"

const fetcher = async ([userId, sparkId]: [string, string]) =>
   sparkService.hasUserLikedSpark(userId, sparkId)

export type UseUserSparkLike = {
   /** Whether the user has liked the spark */
   liked: boolean
   /** Whether the data is loading */
   isLoading: boolean
   /** Whether there was an error fetching the data */
   isError: boolean
   /** Toggle the like for the spark */
   toggleLike: () => Promise<unknown>
}

/**
 * Custom hook to manage the user's like status for a spark.
 * @param {string} userId - The ID of the user.
 * @param {string} sparkId - The ID of the spark.
 * @param {boolean} disabled - Whether the like functionality is disabled.
 * @param {string} explicitKey - An explicit key to use for the SWR and SWRMutation.
 * @returns {UseUserSparkLike} The user's like status and a function to toggle it.
 */
const useUserSparkLike = (
   userId: string,
   sparkId: string,
   disabled?: boolean,
   explicitKey?: [string, string]
): UseUserSparkLike => {
   const enabled = userId && sparkId && !disabled
   const { trackEvent } = useSparksFeedTracker()

   const key = explicitKey || (enabled ? [userId, sparkId] : null)

   const {
      data: userLikesSpark,
      error,
      isLoading: isFetchingLikedStatus,
   } = useSWR(key, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Error fetching spark likes",
            key,
         }),
   })

   const { trigger: toggleLike, isMutating } = useSWRMutation(
      key,
      async (key: [string, string]) => {
         const [userId, sparkId] = key
         return sparkService.toggleSparkLike(userId, sparkId)
      },
      {
         onSuccess: (newLikeStatus) => {
            if (newLikeStatus) {
               trackEvent(SparkEventActions.Like)
            } else {
               trackEvent(SparkEventActions.Unlike)
            }
         },

         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: "Error toggling spark like",
               key,
            }),
      }
   )

   return useMemo(
      () => ({
         liked: userLikesSpark,
         isLoading: isFetchingLikedStatus || isMutating,
         isError: Boolean(error),
         toggleLike,
      }),
      [userLikesSpark, isFetchingLikedStatus, isMutating, error, toggleLike]
   )
}

export default useUserSparkLike
