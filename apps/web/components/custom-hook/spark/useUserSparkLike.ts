import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { sparkService } from "data/firebase/SparksService"
import { useCallback, useMemo } from "react"
import useSWR from "swr"
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

   const {
      data: userLikesSpark,
      error,
      isLoading: isFetchingLikedStatus,
      mutate,
   } = useSWR(enabled ? [userId, sparkId] : null, fetcher, {
      onError: errorLogAndNotify,
   })

   const toggleLike = useCallback(async () => {
      if (!enabled || isFetchingLikedStatus) return

      const newLikeStatus = !userLikesSpark

      // Optimistically update the local data
      mutate(newLikeStatus, false)

      try {
         // Perform the asynchronous toggle operation
         await sparkService.toggleSparkLike(userId, sparkId, newLikeStatus)

         // Track the like event if its a like
         if (newLikeStatus) {
            trackEvent(SparkEventActions.Like)
         }

         // If the operation is successful, update the local data again
         mutate(newLikeStatus)
      } catch (error) {
         // If the operation fails, rollback the local data
         mutate(userLikesSpark)
      }
   }, [
      enabled,
      isFetchingLikedStatus,
      userLikesSpark,
      mutate,
      userId,
      sparkId,
      trackEvent,
   ])

   return useMemo(
      () => ({
         liked: userLikesSpark,
         isLoading: isFetchingLikedStatus,
         isError: Boolean(error),
         toggleLike,
      }),
      [userLikesSpark, isFetchingLikedStatus, error, toggleLike]
   )
}

export default useUserSparkLike
