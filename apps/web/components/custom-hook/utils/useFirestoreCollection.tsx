import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, FirestoreDataConverter } from "firebase/firestore"
import { ReactFireOptions, useFirestoreCollectionData } from "reactfire"

/**
 * Subscribe a Firestore collection for updates
 */
export const useFirestoreCollection = <T extends Identifiable>(
   collectionName: string,
   pathSegments: string[] = [],
   options: ReactFireOptions = {
      idField: "id", // this field will be added to the firestore object
   },
   customConverter: FirestoreDataConverter<T> = createGenericConverter<T>()
) => {
   const docRef = collection(
      FirestoreInstance,
      collectionName,
      ...pathSegments
   ).withConverter(customConverter)

   return useFirestoreCollectionData<T>(docRef, options)
}
