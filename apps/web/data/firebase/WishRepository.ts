import { firebaseServiceInstance } from "./FirebaseService"
import firebase from "firebase/app"
import {
   Wish,
   WishOrderByFields,
   FlagReason,
} from "@careerfairy/shared-lib/dist/wishes"

type CreateAndUpdateWishData = Pick<
   Wish,
   "title" | "companyNames" | "interests" | "category"
>

export interface IWishRepository {
   getWishesQuery(
      orderBy?: [WishOrderByFields, firebase.firestore.OrderByDirection]
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   createWish(data: CreateAndUpdateWishData): Promise<Wish>
   updateWish(
      wishData: CreateAndUpdateWishData,
      wishId: string
   ): Promise<Partial<Wish>>

   deleteWish(wishId: string): Promise<Partial<Wish>>
   toggleRateWish(wishId: string, type: "upvote" | "downvote"): Promise<void>
   deleteWish(wishId: string): Promise<Partial<Wish>>
   restoreDeletedWish(wishId: string): Promise<Partial<Wish>>
   flagWish(wishId: string, reason: FlagReason): Promise<Partial<Wish>>
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

class FirebaseWishRepository implements IWishRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   getWishesQuery(
      orderBy: [WishOrderByFields, firebase.firestore.OrderByDirection] = [
         "created",
         "desc",
      ]
   ): firebase.firestore.Query<firebase.firestore.DocumentData> {
      let query: firebase.firestore.Query<firebase.firestore.DocumentData> =
         this.firestore.collection("wishes").where("isDeleted", "==", false)
      if (orderBy) {
         query = query.orderBy(`${orderBy[0]}`, orderBy[1])
      }
      return query
   }

   async createWish(wishData: CreateAndUpdateWishData): Promise<Wish> {
      const newWish: Wish = {
         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
         updatedAt: null,
         deletedAt: null,
         isDeleted: false,
         numberOfViews: 0,
         numberOfUpvotes: 0,
         numberOfDownvotes: 0,
         numberOfComments: 0,
         isPublic: Boolean(wishData.isPublic),
         title: wishData.title.trim(),
         authorUid: firebase.auth().currentUser?.uid,
         isFlaggedByAdmin: false,
         companyNames: wishData.companyNames,
      }
      const ref = await this.firestore.collection("wishes").add(newWish)
      return { ...newWish, id: ref.id }
   }
   async updateWish(
      wishData: CreateAndUpdateWishData,
      wishId: string
   ): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      // update wish ref
      const updatedWish: Partial<Wish> = {
         updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
         isPublic: Boolean(wishData.isPublic),
         title: wishData.title.trim(),
         companyNames: wishData.companyNames,
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
               updated: firebase.firestore.FieldValue.serverTimestamp(),
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
