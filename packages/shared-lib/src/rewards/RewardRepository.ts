import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import { Create } from "../commonTypes"
import { RewardAction, RewardDoc, REWARDS } from "./rewards"
import { UserData } from "../users"

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

   /**
    * Delete a reward
    */
   delete(userDataId: string, rewardId: string): Promise<void>

   applyCreditsToUser(
      userEmail: string,
      credits: number,
      rewardId?: string
   ): Promise<void>
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

   async delete(userDataId: string, rewardId: string): Promise<void> {
      await this.firestore
         .collection("userData")
         .doc(userDataId)
         .collection("rewards")
         .doc(rewardId)
         .delete()
   }

   /**
    * Applies or deducts credits to/from a user's account.
    *
    * This method is responsible for updating the credits in the user's account.
    * It uses Firestore transactions to ensure data consistency.
    *
    * @example
    * // Applying 10 credits to a user's account
    * await applyCreditsToUser('user@example.com', 10);
    *
    * // Deducting 5 credits from a user's account
    * await applyCreditsToUser('user@example.com', -5);
    */
   async applyCreditsToUser(
      userEmail: string,
      credits: number,
      rewardId: string
   ): Promise<void> {
      if (!credits) return // skip 0/null/undefined credits

      const userRef = this.firestore.collection("userData").doc(userEmail)

      await this.firestore.runTransaction(async (transaction) => {
         const userDoc = await transaction.get(userRef)
         const user = userDoc.data() as UserData

         // Verify that the user possesses enough credits for the deduction operation
         // If not, delete the created reward and throw an error
         if (credits < 0 && user.credits < credits) {
            await this.delete(userEmail, rewardId)
            throw new Error(
               `User ${userEmail} does not have enough credits to deduct the ${rewardId} reward`
            )
         }

         transaction.update(userRef, {
            credits: this.fieldValue.increment(credits),
         })
      })
   }
}

export type RewardFilterFields = Pick<RewardDoc, "livestreamId">
