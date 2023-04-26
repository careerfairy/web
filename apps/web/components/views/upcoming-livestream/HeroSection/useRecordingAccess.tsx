import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { rewardService } from "data/firebase/RewardService"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"

/**
 * Check if the user has access to a livestream recording
 */
export const useRecordingAccess = (
   streamPresenter: LivestreamPresenter,
   recordingSid: string
) => {
   const { userStats, authenticatedUser } = useAuth()

   const userHasBoughtRecording = rewardService.canAccessRecording(
      userStats,
      streamPresenter.id
   )

   const userHasAccessToRecordingThroughRegistering = Boolean(
      streamPresenter.isAbleToShowRecording(
         authenticatedUser?.email,
         recordingSid
      )
   )

   return {
      showRecording:
         userHasAccessToRecordingThroughRegistering || userHasBoughtRecording,
      userHasBoughtRecording,
      userHasAccessToRecordingThroughRegistering,
   }
}

export default useRecordingAccess
