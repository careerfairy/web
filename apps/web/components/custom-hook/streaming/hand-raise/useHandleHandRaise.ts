import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useEffect, useRef } from "react"
import { usePrevious } from "react-use"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useLivestreamData } from "../useLivestreamData"
import { useUpdateUserHandRaiseState } from "./useUpdateUserHandRaiseState"

type UseHandleHandRaiseParams = {
   livestreamId: string
   agoraUserId: string
   disabled: boolean
   isPublishingTracks: boolean
   error: Error
}
/**
 * Manages hand raise state transitions based on the publishing status of user tracks.
 *
 * @param {Object} params - The parameters object.
 * @param {boolean} params.isPublishingTracks - True if user tracks are being published.
 * @param {Error} params.error - Current error state during publishing, if any.
 */
export const useHandleHandRaise = (props: UseHandleHandRaiseParams) => {
   const { livestreamId, agoraUserId, disabled, isPublishingTracks, error } =
      props
   const { trigger: triggerUserHandRaiseState } =
      useUpdateUserHandRaiseState(livestreamId)
   const prevIsPublishingTracks = usePrevious(isPublishingTracks)
   const livestream = useLivestreamData()

   const livestreamRef = useRef(livestream)
   livestreamRef.current = livestream

   useEffect(() => {
      livestreamRef.current = livestream
   }, [livestream])

   useEffect(() => {
      if (disabled) {
         return
      }

      if (prevIsPublishingTracks && !isPublishingTracks && !error) {
         triggerUserHandRaiseState({
            state: HandRaiseState.connected,
            handRaiseId: agoraUserId,
         })

         if (livestreamRef.current) {
            dataLayerLivestreamEvent(
               AnalyticsEvents.LivestreamViewerHandRaiser,
               livestreamRef.current
            )
         }
      } else if (isPublishingTracks && !prevIsPublishingTracks) {
         triggerUserHandRaiseState({
            state: HandRaiseState.connecting,
            handRaiseId: agoraUserId,
         })
      } else if (error) {
         triggerUserHandRaiseState({
            state: HandRaiseState.unrequested,
            handRaiseId: agoraUserId,
         })
      }
   }, [
      error,
      isPublishingTracks,
      prevIsPublishingTracks,
      triggerUserHandRaiseState,
      disabled,
      agoraUserId,
   ])
}
