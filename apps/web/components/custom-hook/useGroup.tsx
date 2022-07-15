import { doc } from "firebase/firestore"
import { useFirestore, useFirestoreDocData } from "reactfire"
import { Group } from "@careerfairy/shared-lib/dist/groups"

const useGroup = (groupId: string) => {
   const collectionRef = doc(useFirestore(), "careerCenterData", groupId)

   let { status, data } = useFirestoreDocData<Group>(collectionRef as any, {
      idField: "id", // this field will be added to the firestore object
   })

   return {
      isLoading: status === "loading",
      data: data,
   }
}

export default useGroup
