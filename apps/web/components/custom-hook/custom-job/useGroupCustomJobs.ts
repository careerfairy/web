import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   livestreamId?: string
}

/**
 * Fetch Custom Jobs based on groupId
 *
 * @param groupId
 * @param options
 */
const useGroupCustomJobs = (groupId: string, options: Options = {}) => {
   const { livestreamId = "" } = options

   const collectionRef = query(
      collection(useFirestore(), "customJobs"),
      where("groupId", "==", groupId),
      ...(livestreamId
         ? [where("livestreams", "array-contains", livestreamId)]
         : []),
      orderBy("createdAt", "desc")
   )

   const { data } = useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useGroupCustomJobs
