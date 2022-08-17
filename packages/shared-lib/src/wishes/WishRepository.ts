import firebase from "firebase/compat/app"
import { CreateWishFormValues, Wish, Rating, FlagReason } from "./wishes"

export interface IWishRepository {
   getWishesQuery(
      options?: GetWishesOptions
   ): firebase.firestore.Query<firebase.firestore.DocumentData>
   getWishes(options?: GetWishesOptions): Promise<Wish[]>
   // todo: This repository shouldn't need to know about UI Forms, refactor this
   createWish(userUid: string, data: CreateWishFormValues): Promise<Wish>
   updateWish(
      wishData: CreateWishFormValues,
      wishId: string
   ): Promise<Partial<Wish>>

   toggleRateWish(
      userUid: string,
      wishId: string,
      type: "upvote" | "downvote"
   ): Promise<Rating>
   deleteWish(wishId: string): Promise<Partial<Wish>>
   restoreDeletedWish(userEmail: string, wishId: string): Promise<Partial<Wish>>
   flagWish(
      userUid: string,
      userEmail: string,
      wishId: string,
      reasons: FlagReason[],
      message?: string
   ): Promise<Partial<Wish>>
   listenToWishRating(
      uid: string,
      wishId: string,
      callback: {
         next?: (
            snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
         ) => void
         error?: (error: firebase.firestore.FirestoreError) => void
         complete?: () => void
      }
   ): firebase.Unsubscribe
   getUserRating(wishId: string, userUid: string): Promise<Rating>
}
interface GetWishesOptions {
   sort?: [
      Wish["numberOfUpvotes"] | Wish["createdAt"],
      firebase.firestore.OrderByDirection
   ]
   targetInterestIds?: string[]
   startAfter?: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
   // Don't use the limit property if you are
   // using a hook that already has it's own limit property
   // use the hook's limit property instead
   limit?: number
}

export class FirebaseWishRepository implements IWishRepository {
   constructor(
      private readonly firestore: firebase.firestore.Firestore,
      private readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {}

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
      if (getWishesOptions.sort) {
         // @ts-ignore
         query = query.orderBy(...getWishesOptions.sort)
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

   async createWish(
      userUid,
      wishFormValues: CreateWishFormValues
   ): Promise<Wish> {
      const docRef = await this.firestore.collection("wishes").doc()
      const newWish: Wish = {
         description: wishFormValues.description.trim(),
         companyNames: wishFormValues.companyNames,
         interestIds: wishFormValues.interests.map((interest) => interest.id),
         interests: wishFormValues.interests,
         createdAt: this.fieldValue.serverTimestamp(),
         authorUid: userUid,
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
         id: docRef.id,
      }
      await this.firestore.collection("wishes").doc(newWish.id).set(newWish)
      return { ...newWish }
   }
   async updateWish(
      wishFormValues: CreateWishFormValues,
      wishId: string
   ): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      // update wish ref
      const updatedWish: Partial<Wish> = {
         updatedAt: this.fieldValue.serverTimestamp(),
         description: wishFormValues.description.trim(),
         companyNames: wishFormValues.companyNames,
         interestIds: wishFormValues.interests.map((interest) => interest.id),
         interests: wishFormValues.interests,
      }
      await wishRef.update(updatedWish)
      return updatedWish
   }

   async deleteWish(wishId: string): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      // update wish ref
      const updatedWish: Partial<Wish> = {
         deletedAt: this.fieldValue.serverTimestamp(),
         isDeleted: true,
      }
      await wishRef.update(updatedWish)

      return updatedWish
   }
   async restoreDeletedWish(
      userEmail: string,
      wishId: string
   ): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      const userRef = this.firestore.collection("userData").doc(userEmail)
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
      uid: string,
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
         .doc(uid)
         .onSnapshot(callback)
   }

   async toggleRateWish(
      userUid: string,
      wishId: string,
      type: "upvote" | "downvote"
   ): Promise<Rating> {
      const ratingRef = this.firestore
         .collection("wishes")
         .doc(wishId)
         .collection("ratings")
         .doc(userUid)
      // run transaction
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(ratingRef).then((ratingDoc) => {
            // @ts-ignore
            let newRating: Rating = {}
            if (!ratingDoc.exists) {
               newRating = {
                  type,
                  createdAt: this.fieldValue.serverTimestamp(),
               }
            } else {
               newRating = ratingDoc.data() as Rating
               const ratingType = ratingDoc.data()?.type
               if (ratingType === type) {
                  // if already rated with same type, undo rating
                  // transaction.delete(ratingRef) // delete rating
                  // TODO deleting and then creating a document in
                  //  transaction with the same ID is bugged on emulators
                  // https://github.com/firebase/firebase-tools/issues/1971
                  // workaround: delete and create again

                  newRating.type = null
               } else {
                  //    if rated with different type
                  newRating.type = type
               }
            }
            transaction.set(ratingRef, newRating, { merge: true })
            return newRating
         })
      })
   }

   async getUserRating(wishId: string, userUid: string): Promise<Rating> {
      const snap = await this.firestore
         .collection("wishes")
         .doc(wishId)
         .collection("ratings")
         .doc(userUid)
         .get()
      if (!snap.exists) return null
      return snap.data() as Rating
   }

   async flagWish(
      userUid: string,
      userEmail: string,
      wishId: string,
      reasons: FlagReason[],
      message?: string
   ): Promise<Partial<Wish>> {
      const wishRef = this.firestore.collection("wishes").doc(wishId)
      const userRef = this.firestore.collection("userData").doc(userEmail)
      const flagRef = this.firestore
         .collection("wishes")
         .doc(wishId)
         .collection("flags")
         .doc(userUid)

      return this.firestore.runTransaction((transaction) => {
         return transaction.get(userRef).then((userDoc) => {
            if (!userDoc.exists) {
               throw "User does not exist"
            }
            const isAdmin = userDoc.data()?.isAdmin
            const updatedWish: Partial<Wish> = {
               updatedAt: this.fieldValue.serverTimestamp(),
               isFlaggedByAdmin: Boolean(isAdmin),
               numberOfFlags: this.fieldValue.increment(1),
            }
            transaction.update(wishRef, updatedWish)
            transaction.set(flagRef, {
               createdAt: this.fieldValue.serverTimestamp(),
               reasons,
               message: message || null,
            })
            return updatedWish
         })
      })
   }
}
