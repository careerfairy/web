import { collection } from "firebase/firestore"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import { GroupAdmin } from "@careerfairy/shared-lib/dist/groups"

const useAdminGroups = (groupId) => {
   const collectionRef = collection(
      useFirestore(),
      "careerCenterData",
      groupId,
      "admins"
   )

   // fetch from firestore
   return useFirestoreCollectionData<GroupAdmin>(collectionRef as any, {
      idField: "id", // this field will be added to the firestore object
      suspense: false,
   })
}

export default useAdminGroups
