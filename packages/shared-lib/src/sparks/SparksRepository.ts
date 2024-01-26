import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import firebase from "firebase/compat"
import { LikedSparks, SeenSparks, SharedSparks } from "./sparks"

export interface ISparkRepository {
   getUserSharedSpark(userId: string): Promise<SharedSparks[]>

   getUserLikedSparks(userId: string): Promise<LikedSparks[]>

   getUserSeenSparks(userId: string): Promise<SeenSparks[]>
}

export class FirebaseSparksRepository
   extends BaseFirebaseRepository
   implements ISparkRepository
{
   protected readonly COLLECTION_NAME = "sparks"

   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   async getUserSharedSpark(userId: string): Promise<SharedSparks[]> {
      const userSharedSparksRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("sharedSparks")

      const snapshots = await userSharedSparksRef.get()

      return mapFirestoreDocuments<SharedSparks>(snapshots)
   }

   async getUserLikedSparks(userId: string): Promise<LikedSparks[]> {
      const userSharedSparksRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("likedSparks")

      const snapshots = await userSharedSparksRef.get()

      return mapFirestoreDocuments<LikedSparks>(snapshots)
   }

   async getUserSeenSparks(userId: string): Promise<SeenSparks[]> {
      const userSharedSparksRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("seenSparks")

      const snapshots = await userSharedSparksRef.get()

      return mapFirestoreDocuments<SeenSparks>(snapshots)
   }
}
