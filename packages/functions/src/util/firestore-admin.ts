import { FirestoreDataConverter, Query } from "firebase-admin/firestore"

export const createGenericConverter = <T>(): FirestoreDataConverter<T> => ({
   toFirestore: (modelObject: T) => modelObject,
   fromFirestore: (snapshot) => {
      return {
         ...snapshot.data(),
         id: snapshot.id,
      } as T
   },
})

export const getCount = async (query: Query) => {
   const snap = await query.count().get()

   return snap.data()?.count ?? 0
}
