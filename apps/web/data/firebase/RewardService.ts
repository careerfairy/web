import { RewardAction } from "@careerfairy/shared-lib/dist/rewards"
import { Firestore } from "firebase/firestore"
import { Functions, httpsCallable } from "firebase/functions"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"

export class RewardService {
   constructor(
      private readonly firestore: Firestore,
      private readonly functions: Functions
   ) {}

   /**
    * Reward user for attending a livestream
    */
   livestreamAttendance(
      livestreamId: string,
      referralCode: string // invite from user owner of the referral code
   ) {
      return httpsCallable(
         this.functions,
         "rewardLivestreamInvitationComplete"
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
}

export const rewardService = new RewardService(
   FirestoreInstance as any,
   FunctionsInstance as any
)

export default RewardService
