import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import { rewardService } from "data/firebase/RewardService"

/**
 * Check if the user has access to a livestream recording
 */
export const useRecordingAccess = (
   userEmail: string | null,
   streamPresenter: LivestreamPresenter,
   userStats: UserStats | null
) => {
   const userHasBoughtRecording = rewardService.canAccessRecording(
      userStats,
      streamPresenter.id
   )

   const userHasAccessToRecordingThroughRegistering = Boolean(
      streamPresenter.isAbleToShowRecording(userEmail)
   )

   return {
      showRecording:
         userHasAccessToRecordingThroughRegistering || userHasBoughtRecording,
      userHasBoughtRecording,
      userHasAccessToRecordingThroughRegistering,
   }
}

export default useRecordingAccess
