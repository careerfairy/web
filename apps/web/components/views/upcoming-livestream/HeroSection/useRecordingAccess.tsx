import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

/**
 * Check if the user has access to a livestream recording
 */
export const useRecordingAccess = (
   userEmail: string | null,
   streamPresenter: LivestreamPresenter
) => {
   return {
      showRecording: streamPresenter?.isAbleToShowRecording(),
   }
}

export default useRecordingAccess
