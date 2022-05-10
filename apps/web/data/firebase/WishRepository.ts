import { firebaseServiceInstance } from "./FirebaseService"
import firebase from "firebase/app"
import {
   Wish,
   WishOrderByFields,
   FlagReason,
} from "@careerfairy/shared-lib/dist/wishes"
import { CreateWishFormValues } from "../../components/views/wishlist/CreateWishDialog"

export interface IWishRepository {
   getWishesQuery(
      options?: GetWishesOptions
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   getWishes(options?: GetWishesOptions): Promise<Wish[]>
   createWish(data: CreateWishFormValues): Promise<Wish>
   updateWish(
      wishData: CreateWishFormValues,
      wishId: string
   ): Promise<Partial<Wish>>

   deleteWish(wishId: string): Promise<Partial<Wish>>
   toggleRateWish(wishId: string, type: "upvote" | "downvote"): Promise<void>
   deleteWish(wishId: string): Promise<Partial<Wish>>
   restoreDeletedWish(wishId: string): Promise<Partial<Wish>>
   flagWish(wishId: string, reasons: FlagReason[]): Promise<Partial<Wish>>
   listenToWishRating(
      wishId: string,
      callback: {
         next?: (
            snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
         ) => void
         error?: (error: firebase.firestore.FirestoreError) => void
         complete?: () => void
      }
   ): firebase.Unsubscribe
}
interface GetWishesOptions {
   orderByDate?: firebase.firestore.OrderByDirection
   orderByUpvotes?: firebase.firestore.OrderByDirection
   targetInterestIds?: string[]
   startAfter?: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
   // Don't use the limit property if you are
   // using a hook that already has it's own limit property
   // use the hook's limit property instead
   limit?: number
}
class FirebaseWishRepository implements IWishRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   getWishesQuery(
      getWishesOptions: GetWishesOptions = {}
   ): firebase.firestore.Query<firebase.firestore.DocumentData> {
      let query: firebase.firestore.Query<firebase.firestore.DocumentData> =
         this.firestore
            .collection("wishes")
            .where("isDeleted", "==", false)
            .where("isPublic", "==", true)
      if (getWishesOptions.targetInterestIds?.length > 0) {
         query = query.where(
            "interestIds",
            "array-contains-any",
            getWishesOptions.targetInterestIds
         )
      }
      // startAfter is used to paginate
      if (getWishesOptions.startAfter) {
         query = query.startAfter(getWishesOptions.startAfter)
      }
      if (getWishesOptions.orderByUpvotes) {
         query = query.orderBy(
            "numberOfUpvotes",
            getWishesOptions.orderByUpvotes
         )
      }
      if (getWishesOptions.orderByDate) {
         query = query.orderBy("createdAt", getWishesOptions.orderByDate)
      }

      if (getWishesOptions.limit) {
         query = query.limit(getWishesOptions.limit)
      }
      return query
   }

   async getWishes(options?: GetWishesOptions): Promise<Wish[]> {
      const query = this.getWishesQuery(options)
      const snapshot = await query.get()
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Wish))
   }

   async createWish(wishFormValues: CreateWishFormValues): Promise<Wish> {
      const newWish: Omit<Wish, "id"> = {
         description: wishFormValues.description.trim(),
         companyNames: wishFormValues.companyNames,
         interestIds: wishFormValues.interests.map((interest) => interest.id),
         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
         authorUid: firebase.auth().currentUser?.uid,
         updatedAt: null,
         deletedAt: null,
         uidsOfRecentUpvoters: [],
         isDeleted: false,
         numberOfViews: 0,
         numberOfUpvotes: 0,
         numberOfDownvotes: 0,
         numberOfComments: 0,
         isPublic: true,
         isFlaggedByAdmin: false,
         numberOfFlags: 0,
         flaggedByAdminAt: null,
      }
      const ref = await this.firestore.collection("wishes").add(newWish)
      return { ...newWish, id: ref.id }
   }
   async updateWish(
      wishFormValues: CreateWishFormValues,
      wishId: string
   ): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      // update wish ref
      const updatedWish: Partial<Wish> = {
         updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
         description: wishFormValues.description.trim(),
         companyNames: wishFormValues.companyNames,
         interestIds: wishFormValues.interests.map((interest) => interest.id),
      }
      await wishRef.update(updatedWish)
      return updatedWish
   }

   async deleteWish(wishId: string): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      // update wish ref
      const updatedWish: Partial<Wish> = {
         deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
         isDeleted: true,
      }
      await wishRef.update(updatedWish)

      return updatedWish
   }
   async restoreDeletedWish(wishId: string): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      const userRef = this.firestore
         .collection("userData")
         .doc(firebase.auth().currentUser?.email)
      // run transaction
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(userRef).then((userDoc) => {
            if (!userDoc.exists) {
               throw "User does not exist"
            }
            const isAdmin = userDoc.data()?.isAdmin
            if (!isAdmin) {
               throw "Only admins can restore deleted wishes"
            }
            // update wish ref
            const updatedWish: Partial<Wish> = {
               deletedAt: null,
               isDeleted: false,
            }
            transaction.update(wishRef, updatedWish)
            return updatedWish
         })
      })
   }

   listenToWishRating(
      wishId: string,
      callback: {
         next?: (
            snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
         ) => void
         error?: (error: firebase.firestore.FirestoreError) => void
         complete?: () => void
      }
   ) {
      return this.firestore
         .collection("wishes")
         .doc(wishId)
         .collection("ratings")
         .doc(firebase.auth().currentUser?.uid)
         .onSnapshot(callback)
   }

   async toggleRateWish(
      wishId: string,
      type: "upvote" | "downvote"
   ): Promise<void> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      const ratingRef = this.firestore
         .collection("wishes")
         .doc(wishId)
         .collection("ratings")
         .doc(firebase.auth().currentUser?.uid)
      // run transaction
      const numberOfUpvotesField =
         type === "upvote" ? "numberOfUpvotes" : "numberOfDownvotes"
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(ratingRef).then((ratingDoc) => {
            let updatedWish: Partial<Wish> = {}
            if (!ratingDoc.exists) {
               // If never rated before
               if (type === "upvote") {
                  updatedWish.numberOfUpvotes =
                     firebase.firestore.FieldValue.increment(1)
               } else {
                  updatedWish.numberOfDownvotes =
                     firebase.firestore.FieldValue.increment(1)
               }
               transaction.set(ratingRef, {
                  type,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
               })
            } else {
               const ratingType = ratingDoc.data()?.type
               if (ratingType === type) {
                  // if already rated with same type, undo rating
                  transaction.delete(ratingRef) // delete rating
                  updatedWish[numberOfUpvotesField] =
                     firebase.firestore.FieldValue.increment(-1) // decrement
               } else {
                  //    if rated with different type
                  transaction.update(ratingRef, {
                     type,
                  })
                  if (type === "upvote") {
                     // if upvoting
                     updatedWish.numberOfUpvotes =
                        firebase.firestore.FieldValue.increment(1)
                     // increment upvotes by 1 and decrement downvotes by 1
                     // if downvoted before (if any) and vice versa if downvoted before
                     updatedWish.numberOfDownvotes =
                        firebase.firestore.FieldValue.increment(-1)
                  } else {
                     // if downvoting
                     updatedWish.numberOfUpvotes =
                        firebase.firestore.FieldValue.increment(-1)
                     // decrement upvotes by 1 and increment downvotes by 1
                     // (because we are downvoting)
                     updatedWish.numberOfDownvotes =
                        firebase.firestore.FieldValue.increment(1)
                  }
               }
            }
            transaction.update(wishRef, updatedWish)
         })
      })
   }

   async flagWish(
      wishId: string,
      reasons: FlagReason[]
   ): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      const userRef = this.firestore
         .collection("userData")
         .doc(firebase.auth().currentUser?.email)
      const flagRef = this.firestore
         .collection("wishes")
         .doc(wishId)
         .collection("flags")
         .doc(firebase.auth().currentUser?.uid)

      return this.firestore.runTransaction((transaction) => {
         return transaction.get(userRef).then((userDoc) => {
            if (!userDoc.exists) {
               throw "User does not exist"
            }
            const isAdmin = userDoc.data()?.isAdmin
            const updatedWish: Partial<Wish> = {
               updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
               isFlaggedByAdmin: Boolean(isAdmin),
               numberOfFlags: firebase.firestore.FieldValue.increment(1),
            }
            transaction.update(wishRef, updatedWish)
            transaction.set(flagRef, {
               createdAt: firebase.firestore.FieldValue.serverTimestamp(),
               reasons,
            })
            return updatedWish
         })
      })
   }
}

// Singleton
const userRepo: IWishRepository = new FirebaseWishRepository(
   firebaseServiceInstance.firestore
)

export default userRepo
