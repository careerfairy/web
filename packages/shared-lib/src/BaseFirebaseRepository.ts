import firebase from "firebase/compat/app"
import { Identifiable } from "./commonTypes"
import QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
import { FirestoreDataConverter, QuerySnapshot as QS } from "firebase/firestore"

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
   return array?.reduce((dict, doc) => {
      dict[doc.id] = doc
      return dict
   }, {} as Record<T["id"], T>)
}

/**
 * Map dictionary of Firestore documents to an array of documents
 * @param dict
 */
export function convertDictToDocArray<T>(dict: Record<string, T>): T[] {
   return dict
      ? Object.keys(dict).map((key) => ({
           ...dict[key],
           id: key,
        }))
      : []
}

/**
 * Add the document id to the document itself
 *
 * @param documentSnapshot
 * @param withRef
 */
export function mapFirestoreDocuments<T, R extends boolean = false>(
   documentSnapshot: QuerySnapshot | QS,
   withRef?: R
): (R extends true ? T & DocRef : T)[] | null {
   let docs = null
   if (!documentSnapshot.empty) {
      docs = documentSnapshot.docs.map((doc) => ({
         ...doc.data(),
         id: doc.id,
         ...(withRef ? { _ref: doc.ref } : {}),
      }))
   }
   return docs
}

export type OnSnapshotCallback<T> = (
   snapshot: firebase.firestore.QuerySnapshot<T>
) => void

export type Unsubscribe = () => void

export type DocRef = {
   _ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
}

/**
 * Remove duplicate documents by id from array
 *
 * @param docs
 */
export function removeDuplicateDocuments<T extends Identifiable>(
   docs: T[]
): T[] {
   return docs.filter((item, index) => {
      return docs.findIndex((i) => i.id === item.id) === index
   })
}

// max of 10 events to allow for firestore query limit
export type FirebaseInArrayLimit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/*
 This is a function that returns a Firestore data converter object.
 The data converter is used to specify how documents in a Firestore
 collection should be converted to and from objects in your application at runtime.
*
 We could also create a livestreamPresenterConverter object and use it
 and have all its business logic methods
 when we call doc.data().

[Official docs example](https://firebase.google.com/docs/reference/js/v8/firebase.firestore.FirestoreDataConverter)

@example
 const livestreamConverter = createGenericConverter<LivestreamEvent>()
 const livestreamSnap = firestore.collection('livestreams')
                         .doc("livestreamId")
                        .withConverter(userConverter)

 const livestream = livestreamSnap.data();
 if (livestream !== undefined) {
    livestream.title; // string
    livestream.start.toDate(); // returns a Date object
    livestream.someNonExistentProperty; // TS error
 }
 */
export const createGenericConverter = <
   T extends Identifiable
>(): FirestoreDataConverter<T> => ({
   toFirestore(modelObject: T) {
      return modelObject
   },

   fromFirestore(snapshot, options): T {
      return {
         ...snapshot.data(options),
         id: snapshot.id,
      } as T
   },
})
export const createCompatGenericConverter = <
   T extends Identifiable
>(): firebase.firestore.FirestoreDataConverter<T> => ({
   toFirestore(modelObject: T) {
      return modelObject
   },
   fromFirestore(snapshot, options): T {
      return {
         ...snapshot.data(options),
         id: snapshot.id,
      } as T
   },
})
