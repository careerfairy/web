import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { useAppDispatch } from "components/custom-hook/store"
import { useLivestreamData } from "components/custom-hook/streaming"
import { useEffect } from "react"
import {
   setHasEnded,
   setLivestreamMode,
   setNumberOfParticipants,
   setScreenSharerId,
   setStarted,
   setStartsAt,
} from "store/reducers/streamingAppReducer"

/**
 * Component to track and update the livestream state in the Redux store.
 *
 * It uses the `useLivestreamData` hook to get the current livestream data and then dispatches
 * this data to the Redux store using the `setLivestreamState` action from `streamingAppReducer.ts`.
 * That way, we can subscribe to parts of the state without re-rendering the entire component.
 *
 * @returns {null} This component does not render anything.
 */
export const LivestreamStateTrackers = (): null => {
   const dispatch = useAppDispatch()
   const livestream = useLivestreamData()

   useEffect(() => {
      dispatch(setLivestreamMode(livestream.mode ?? LivestreamModes.DEFAULT))
   }, [dispatch, livestream.mode])

   useEffect(() => {
      dispatch(setScreenSharerId(livestream.screenSharerId ?? null))
   }, [dispatch, livestream.screenSharerId])

   useEffect(() => {
      dispatch(
         setNumberOfParticipants(livestream.participatingStudents?.length ?? 0)
      )
   }, [dispatch, livestream.participatingStudents?.length])

   // convert to primitive for comparison
   const startsAtMillis = livestream.start?.toMillis() ?? null
   useEffect(() => {
      dispatch(setStartsAt(startsAtMillis))
   }, [dispatch, startsAtMillis])

   // Convert to primitive for comparison
   const startedAtMillis = livestream.startedAt?.toMillis() ?? null
   /**
    * Dispatch both `hasStarted` and `startedAt` as the same time to avoid race conditions.
    */
   useEffect(() => {
      dispatch(
         setStarted({
            hasStarted: livestream.hasStarted,
            startedAt: startedAtMillis,
         })
      )
   }, [dispatch, livestream.hasStarted, startedAtMillis])

   useEffect(() => {
      dispatch(setHasEnded(Boolean(livestream.hasEnded)))
   }, [dispatch, livestream.hasEnded])

   // Clean up the state on unmount
   useEffect(() => {
      return () => {
         dispatch(setNumberOfParticipants(0))
         dispatch(setScreenSharerId(null))
         dispatch(setLivestreamMode(LivestreamModes.DEFAULT))
         dispatch(setStartsAt(null))
         dispatch(setHasEnded(false))
         dispatch(setStarted({ hasStarted: false, startedAt: null }))
      }
   }, [dispatch])

   return null
}
