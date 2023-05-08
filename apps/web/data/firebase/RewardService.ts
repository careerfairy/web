import { RewardAction } from "@careerfairy/shared-lib/rewards"
import {
   IRewardRepository,
   RewardFilterFields,
} from "@careerfairy/shared-lib/rewards/RewardRepository"
import { UserStats } from "@careerfairy/shared-lib/users"
import { rewardsRepo } from "data/RepositoryInstances"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class RewardService {
   constructor(
      private readonly repository: IRewardRepository,
      private readonly functions: Functions
   ) {}

   /**
    * Buy access to a livestream recording
    *
    * A cloud function is called to create the reward document
    *
    * The credits will be deducted from the user's account after a
    * side effect (different cloud function) runs
    */
   buyRecordingAccess(livestreamId: string) {
      return this.buy("LIVESTREAM_RECORDING_BOUGHT", { livestreamId })
   }

   /**
    * Checks if the user has access to a livestream recording
    *
    * The bought recordings should be on the user stats document
    */
   canAccessRecording(userStats: UserStats, livestreamId: string) {
      if (userStats?.recordingsBought?.includes(livestreamId)) {
         return true
      }

      return false
   }

   /**
    * Reward user for attending a livestream
    */
   livestreamAttendance(
      livestreamId: string,
      referralCode: string // invite from user owner of the referral code
   ) {
      return httpsCallable(
         this.functions,
         "rewardLivestreamInvitationComplete_eu"
      )({
         livestreamId,
         referralCode,
      })
   }

   /**
    * Reward user for performing an action
    */
   userAction(action: RewardAction, livestreamId?: string) {
      return httpsCallable(
         this.functions,
         "rewardUserAction"
      )({
         action,
         livestreamId,
      })
   }

   /**
    * Buy access to a something
    *
    * Creates a reward document if all validation passes inside the cloud function
    */
   private buy(action: RewardAction, filters: RewardFilterFields) {
      return this.userAction(action, filters.livestreamId)
   }

   /**
    * Checks if a user has access to a resource
    *
    * If there is a reward document, access should be granted
    */
   private async canAccess(
      userEmail: string,
      action: RewardAction,
      filters: RewardFilterFields
   ) {
      const doc = await this.repository.get(userEmail, action, filters)

      return Boolean(doc)
   }
}

export const rewardService = new RewardService(
   rewardsRepo,
   FunctionsInstance as any
)

export default RewardService
