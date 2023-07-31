import { FirestoreDataConverter } from "firebase-admin/firestore"

export const createGenericConverter = <T>(): FirestoreDataConverter<T> => ({
   toFirestore: (modelObject: T) => modelObject,
   fromFirestore: (snapshot) => {
      return {
         ...snapshot.data(),
         id: snapshot.id,
      } as T
   },
})
