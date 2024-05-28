import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { Spark } from "./sparks"

export interface ISparkRepository {
   getPublicSparksFeed(limit?: number): Promise<Spark[]>

   /**
    * Retrieves the sparks via the provided IDs.
    * CAUTION: IDs must not surpass length of 30, more info here https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
    * @param ids
    * @param limit
    */
   getSparksByIds(ids: string[], limit?: number)
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

   async getSparksByIds(ids: string[], limit?: number): Promise<Spark[]> {
      // CAUTION: IDs must not surpass length of 30, more info here https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
      let query = this.firestore
         .collection("sparks")
         .where("id", "in", ids)
         .orderBy("publishedAt", "desc")

      if (limit > 0) {
         query = query.limit(limit)
      }

      const sparks = await query.get()

      return mapFirestoreDocuments<Spark>(sparks)
   }
}
