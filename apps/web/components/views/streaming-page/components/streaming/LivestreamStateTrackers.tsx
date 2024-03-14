import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { useAppDispatch } from "components/custom-hook/store"
import { useLivestreamData } from "components/custom-hook/streaming"
import { useEffect } from "react"
import {
   setLivestreamMode,
   setNumberOfParticipants,
   setScreenSharerId,
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

   // Clean up the state on unmount
   useEffect(() => {
      return () => {
         dispatch(setNumberOfParticipants(0))
         dispatch(setScreenSharerId(null))
         dispatch(setLivestreamMode(LivestreamModes.DEFAULT))
      }
   }, [dispatch])

   return null
}
