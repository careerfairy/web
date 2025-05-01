import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import { collection, orderBy, query } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

export const useUserSavedJobs = () => {
   const { userData } = useAuth()

   const collectionRef = query(
      collection(useFirestore(), "userData", userData?.id, "savedJobs"),
      orderBy("deadline", "asc")
   )

   const result = useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
      suspense: false,
   })

   return {
      ...result,
      data: result.data ?? [],
   }
}
