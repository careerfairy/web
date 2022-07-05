import firebase from "firebase/app"
import { Identifiable } from "./commonTypes"
import { QuerySnapshot } from "@firebase/firestore-types"
type DocumentSnapshot = firebase.firestore.DocumentSnapshot

/**
 * Utility methods for Firebase based repositories
 */
export default class BaseFirebaseRepository {
   /**
    * Add the id property to every doc object
    *
    * @param docs
    */
   addIdToDocs<T extends Identifiable>(docs: DocumentSnapshot[]): T[] {
      const result = []

      for (let doc of docs) {
         result.push(this.addIdToDoc(doc))
      }

      return result
   }

   /**
    * Add the id property to a doc object
    * @param doc
    */
   addIdToDoc<T extends Identifiable>(doc: DocumentSnapshot): T {
      return {
         ...doc.data(),
         id: doc.id,
      } as T
   }
}

/**
 * Add the document id to the document itself
 *
 * @param documentSnapshot
 */
export function mapFirestoreDocuments<T>(
   documentSnapshot: QuerySnapshot
): T[] | null {
   let docs = null
   if (!documentSnapshot.empty) {
      docs = documentSnapshot.docs.map((doc) => ({
         ...doc.data(),
         id: doc.id,
      }))
   }
   return docs
}
