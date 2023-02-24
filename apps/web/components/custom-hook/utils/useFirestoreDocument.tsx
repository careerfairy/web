import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { doc } from "firebase/firestore"
import { ReactFireOptions, useFirestore, useFirestoreDocData } from "reactfire"

export const useFirestoreDocument = <T,>(
   collection: string,
   pathSegments: string[],
   options: ReactFireOptions = {
      idField: "id", // this field will be added to the firestore object
   }
) => {
   // @ts-ignore
   const docRef = doc(FirestoreInstance, collection, ...pathSegments)

   return useFirestoreDocData<T>(docRef as any, options)
}
