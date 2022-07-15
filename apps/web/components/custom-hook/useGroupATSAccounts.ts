import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups"
import { collection } from "firebase/firestore"
import { useFirestore, useFirestoreCollectionData } from "reactfire"

const useGroupATSAccounts = (groupId: string) => {
   const collectionRef = collection(
      useFirestore(),
      "careerCenterData",
      groupId,
      "ats"
   )

   let { status, data } = useFirestoreCollectionData<GroupATSAccount>(
      collectionRef as any,
      {
         idField: "id", // this field will be added to the firestore object
      }
   )

   return {
      isLoading: status === "loading",
      data: data,
   }
}

export default useGroupATSAccounts
