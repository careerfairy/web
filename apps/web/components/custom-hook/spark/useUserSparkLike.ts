import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { sparkService } from "data/firebase/SparksService"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useSWRMutation from "swr/mutation"

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
   toggleLike: () => Promise<any>
}

/**
 * Custom hook to manage the user's like status for a spark.
 * @param {string} userId - The ID of the user.
 * @param {string} sparkId - The ID of the spark.
 * @param {boolean} disabled - Whether the like functionality is disabled.
 * @returns {UseUserSparkLike} The user's like status and a function to toggle it.
 */
const useUserSparkLike = (
   userId: string,
   sparkId: string,
   disabled?: boolean
): UseUserSparkLike => {
   const enabled = userId && sparkId && !disabled
   const { trackEvent } = useSparksFeedTracker()

   const key = enabled ? [userId, sparkId] : null

   const {
      data: userLikesSpark,
      error,
      isLoading: isFetchingLikedStatus,
   } = useSWR(key, fetcher, {
      onError: errorLogAndNotify,
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

         onError: errorLogAndNotify,
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
