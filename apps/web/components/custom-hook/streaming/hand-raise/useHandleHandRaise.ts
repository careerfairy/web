import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { livestreamService } from "data/firebase/LivestreamService"
import { useEffect, useRef } from "react"
import { usePrevious } from "react-use"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
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

   const livestreamIdRef = useRef(livestreamId)
   livestreamIdRef.current = livestreamId

   useEffect(() => {
      if (disabled) {
         return
      }

      if (prevIsPublishingTracks && !isPublishingTracks && !error) {
         triggerUserHandRaiseState({
            state: HandRaiseState.connected,
            handRaiseId: agoraUserId,
         })

         livestreamService
            .getById(livestreamIdRef.current)
            .then((livestream) => {
               dataLayerLivestreamEvent(
                  AnalyticsEvents.LivestreamViewerHandRaiser,
                  livestream
               )
            })
            .catch(console.error)
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
