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
 * Map array of Firestore documents to a dictionary of documents
 * @param array
 */
export function convertDocArrayToDict<T extends Identifiable>(
   array: T[]
): Record<T["id"], T> {
   return array.reduce((dict, doc) => {
      dict[doc.id] = doc
      return dict
   }, {} as Record<T["id"], T>)
}

/**
 * Map dictionary of Firestore documents to an array of documents
 * @param dict
 */
export function convertDictToDocArray<T extends Identifiable>(
   dict: Record<T["id"], T>
): T[] {
   return Object.values(dict)
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

export type OnSnapshotCallback<T> = (
   snapshot: firebase.firestore.QuerySnapshot<T>
) => void

export type Unsubscribe = () => void
