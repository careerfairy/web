import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import { Create } from "../commonTypes"
import { RewardAction, RewardDoc, REWARDS } from "./rewards"

export interface IRewardRepository {
   /**
    * Creates a reward for a user
    */
   create(
      rewardedUserId: string,
      action: RewardAction,
      otherData?: Partial<RewardDoc>
   ): Promise<void>

   /**
    * Get a reward
    */
   get(
      userDataId: string,
      action: RewardAction,
      filters?: RewardFilterFields
   ): Promise<RewardDoc | null>

   applyCreditsToUser(userEmail: string, credits: number): Promise<void>
}

export class FirebaseRewardRepository
   extends BaseFirebaseRepository
   implements IRewardRepository
{
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue,
      readonly timestamp: typeof firebase.firestore.Timestamp
   ) {
      super()
   }

   async create(
      rewardedUserId: string,
      action: RewardAction,
      otherData: Partial<RewardDoc> = {}
   ): Promise<void> {
      const shouldNotifyUser = Boolean(REWARDS[action]?.shouldNotifyUser)

      const doc: Create<RewardDoc> = Object.assign(
         {
            action: action,
            seenByUser: shouldNotifyUser ? false : true,
            createdAt: this.fieldValue.serverTimestamp(),
            credits: REWARDS[action]?.credits ?? 0,
         },
         otherData
      )

      await this.firestore
         .collection("userData")
         .doc(rewardedUserId)
         .collection("rewards")
         .add(doc)
   }

   async get(
      userDataId: string,
      action: RewardAction,
      filters: RewardFilterFields = {}
   ): Promise<RewardDoc | null> {
      let query = this.firestore
         .collection("userData")
         .doc(userDataId)
         .collection("rewards")
         .where("action", "==", action)

      if (filters.livestreamId) {
         query = query.where("livestreamId", "==", filters.livestreamId)
      }

      const querySnapshot = await query
         .withConverter(createCompatGenericConverter<RewardDoc>())
         .limit(1)
         .get()

      if (querySnapshot.empty) {
         return null
      }

      return querySnapshot.docs[0].data()
   }

   async applyCreditsToUser(userEmail: string, credits: number): Promise<void> {
      if (!credits) return // skip 0/null/undefined credits

      await this.firestore
         .collection("userData")
         .doc(userEmail)
         .update({
            credits: this.fieldValue.increment(credits),
         })
   }
}

export type RewardFilterFields = Pick<RewardDoc, "livestreamId">
