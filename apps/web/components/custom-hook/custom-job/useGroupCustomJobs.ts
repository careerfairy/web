import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

/**
 * Fetch Custom Jobs based on groupId
 *
 * @param groupId
 */
const useGroupCustomJobs = (groupId: string) => {
   const collectionRef = query(
      collection(useFirestore(), "customJobs"),
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc")
   )

   const { data } = useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useGroupCustomJobs
