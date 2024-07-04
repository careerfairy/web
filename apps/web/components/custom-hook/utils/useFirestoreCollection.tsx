import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { Query } from "@firebase/firestore"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import type firebase from "firebase/compat/app"
import { collection } from "firebase/firestore"
import { ReactFireOptions, useFirestoreCollectionData } from "reactfire"

/**
 * Subscribe a Firestore collection for updates
 */
export const useFirestoreCollection = <T extends Identifiable>(
   collectionNameOrQuery: string | Query | firebase.firestore.Query,
   options: ReactFireOptions = {
      idField: "id", // this field will be added to the firestore object
   }
) => {
   const query =
      typeof collectionNameOrQuery === "string"
         ? collection(FirestoreInstance, collectionNameOrQuery)
         : collectionNameOrQuery

   // Sadly, converters causes infinite loop for this specific hook, so we have to use this workaround
   return useFirestoreCollectionData<T>(query as Query<T>, options)
}
