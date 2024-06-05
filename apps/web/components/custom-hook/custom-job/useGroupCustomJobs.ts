import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   livestreamId?: string
   sparkId?: string
}

/**
 * Fetch Custom Jobs based on groupId
 *
 * @param groupId
 * @param options
 */
const useGroupCustomJobs = (groupId: string, options: Options = {}) => {
   const { livestreamId = "", sparkId = "" } = options

   const collectionRef = query(
      collection(useFirestore(), "customJobs"),
      where("groupId", "==", groupId),
      ...(livestreamId
         ? [where("livestreams", "array-contains", livestreamId)]
         : []),
      ...(sparkId ? [where("sparks", "array-contains", sparkId)] : []),
      orderBy("createdAt", "desc")
   )

   const { data } = useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useGroupCustomJobs
