import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { Spark } from "./sparks"

export interface ISparkRepository {
   getPublicSparksFeed(limit?: number): Promise<Spark[]>
}

export class FirebaseSparkRepository
   extends BaseFirebaseRepository
   implements ISparkRepository
{
   constructor(readonly firestore: firebase.firestore.Firestore) {
      super()
   }

   async getPublicSparksFeed(limit?: number): Promise<Spark[]> {
      let query = this.firestore
         .collection("sparks")
         .where("group.publicSparks", "==", true)
         .orderBy("publishedAt", "desc")

      if (limit > 0) {
         query = query.limit(limit)
      }

      const publicFeedSnap = await query.get()

      return mapFirestoreDocuments<Spark>(publicFeedSnap)
   }
}
