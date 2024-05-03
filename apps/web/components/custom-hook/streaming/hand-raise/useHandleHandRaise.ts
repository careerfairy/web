import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useEffect } from "react"
import { usePrevious } from "react-use"
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
export const useHandleHandRaise = ({
   livestreamId,
   agoraUserId,
   disabled,
   isPublishingTracks,
   error,
}: UseHandleHandRaiseParams) => {
   const { trigger: triggerUserHandRaiseState } = useUpdateUserHandRaiseState(
      livestreamId,
      agoraUserId
   )
   const prevIsPublishingTracks = usePrevious(isPublishingTracks)

   useEffect(() => {
      if (disabled) {
         return
      }

      if (prevIsPublishingTracks && !isPublishingTracks && !error) {
         triggerUserHandRaiseState(HandRaiseState.connected)
      } else if (isPublishingTracks) {
         triggerUserHandRaiseState(HandRaiseState.connecting)
      } else if (error) {
         triggerUserHandRaiseState(HandRaiseState.unrequested)
      }
   }, [
      error,
      isPublishingTracks,
      prevIsPublishingTracks,
      triggerUserHandRaiseState,
      disabled,
   ])
}
