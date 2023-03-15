import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection } from "firebase/firestore"
import { ReactFireOptions, useFirestoreCollectionData } from "reactfire"
import { Query as FirestoreQuery } from "@firebase/firestore"

/**
 * Subscribe a Firestore collection for updates
 */
export const useFirestoreCollection = <T extends Identifiable>(
   collectionNameOrQuery: string | FirestoreQuery,
   options: ReactFireOptions = {
      idField: "id", // this field will be added to the firestore object
   }
) => {
   const query =
      typeof collectionNameOrQuery === "string"
         ? collection(FirestoreInstance, collectionNameOrQuery)
         : collectionNameOrQuery

   return useFirestoreCollectionData<T>(query as FirestoreQuery<T>, options)
}
