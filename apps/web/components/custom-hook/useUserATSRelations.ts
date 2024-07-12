import { UserATSDocument } from "@careerfairy/shared-lib/users"
import { doc } from "firebase/firestore"
import { useFirestore, useFirestoreDocData } from "reactfire"

/**
 * Fetch ATS relations from the user
 *
 */
const useUserATSRelations = (userId: string): UserATSDocument => {
   const docRef = doc(
      useFirestore(),
      "userData",
      userId,
      "atsRelations",
      "atsRelations"
   )

   // fetch from firestore
   const { data } = useFirestoreDocData<UserATSDocument>(docRef as any, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useUserATSRelations
