import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
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

   return useMemo(() => {
      if (rtmFailedToJoin) {
         /**
          * Fall back to the number of participants in the stream doc if RTM fails to join
          */
         return currentLivestream?.participatingStudents?.length ?? 0
      }

      return numberOfViewersRTM
   }, [
      currentLivestream?.participatingStudents?.length,
      numberOfViewersRTM,
      rtmFailedToJoin,
   ])
}
