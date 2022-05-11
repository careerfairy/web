import { firebaseServiceInstance } from "./FirebaseService"
import firebase from "firebase/app"
import { FlagReason, Rating, Wish } from "@careerfairy/shared-lib/dist/wishes"
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
   toggleRateWish(
      userUid: string,
      wishId: string,
      type: "upvote" | "downvote"
   ): Promise<Rating>
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
   getUserRating(wishId: string, userUid: string): Promise<Rating>
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
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
const wishRepo: IWishRepository = new FirebaseWishRepository(
   firebaseServiceInstance.firestore
)

export default wishRepo
