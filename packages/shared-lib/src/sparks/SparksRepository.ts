import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { Spark } from "./sparks"

const SPARKS_COLLECTION = "sparks"

export interface ISparksRepository {
   getSparks(qs: { limit: number }): Promise<Spark[]>
}

export class FirebaseSpaksRepository
   extends BaseFirebaseRepository
   implements ISparksRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   async getSparks({ limit = 8 }): Promise<Spark[]> {
      const sparksRef = this.firestore
         .collection(SPARKS_COLLECTION)
         .limit(limit)
         .orderBy("createdAt", "desc")

      const snapshots = await sparksRef.get()
      const sparks = mapFirestoreDocuments<Spark>(snapshots)
      console.log("----------------------", sparks)
      return sparks
   }
}
