import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { Spark } from "./sparks"

const SPARKS_COLLECTION = "sparks"
const DEFAULT_SPARKS_FETCH_LIMIT = 8

export interface ISparksRepository {
   getSparks({ limit }: { limit?: number }): Promise<Spark[] | null>
}

export class FirebaseSpaksRepository
   extends BaseFirebaseRepository
   implements ISparksRepository
{
   constructor(protected readonly firestore: firebase.firestore.Firestore) {
      super()
   }

   async getSparks({ limit }): Promise<Spark[]> {
      const snapshots = await this.firestore
         .collection(SPARKS_COLLECTION)
         .limit(limit ?? DEFAULT_SPARKS_FETCH_LIMIT)
         .get()

      return !snapshots.empty ? mapFirestoreDocuments<Spark>(snapshots) : []
   }
}
