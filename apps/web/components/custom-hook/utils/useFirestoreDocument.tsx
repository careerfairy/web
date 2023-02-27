import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { doc } from "firebase/firestore"
import { ReactFireOptions, useFirestoreDocData } from "reactfire"

/**
 * Subscribe a Firestore document for updates
 */
export const useFirestoreDocument = <T extends Identifiable>(
   collection: string,
   pathSegments: string[],
   options: ReactFireOptions = {
      idField: "id", // this field will be added to the firestore object
   }
) => {
   const docRef = doc(
      FirestoreInstance,
      collection,
      ...pathSegments
   ).withConverter(createGenericConverter<T>())

   return useFirestoreDocData<T>(docRef, options)
}
