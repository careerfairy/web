import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useLivestreamUsersCount } from "components/custom-hook/live-stream/useLivestreamUsersCount"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { RootState } from "store"
import { sessionRTMFailedToJoin } from "store/selectors/streamSelectors"

/**
 * Gets the number of livestream viewers
 *
 * Fallsback to firestore data if RTM fails to join
 */
export const useNumberOfViewers = (currentLivestream: LivestreamEvent) => {
   const numberOfViewersRTM = useSelector((state: RootState) =>
      currentLivestream?.hasStarted ? state.stream.stats.numberOfViewers : 0
   )
   const rtmFailedToJoin = useSelector(sessionRTMFailedToJoin)

   const { count: participatedUsersCount } = useLivestreamUsersCount(
      currentLivestream.id,
      "participated",
      {
         disabled: !rtmFailedToJoin, // When we fail to connect to RTM to get the users count, we fallback to counting the participants in the userLivestreamData collection
         refreshInterval: 20000, // Refresh the count every 20 seconds
      }
   )

   return useMemo(() => {
      if (rtmFailedToJoin) {
         /**
          * Fall back to the number of participants in the stream doc if RTM fails to join
          */
         return isNaN(participatedUsersCount) ? 0 : participatedUsersCount
      }

      return numberOfViewersRTM
   }, [numberOfViewersRTM, participatedUsersCount, rtmFailedToJoin])
}
