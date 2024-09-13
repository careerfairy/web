import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   livestreamId?: string
   sparkId?: string
   includePermanentlyExpired?: boolean
}

/**
 * Retrieves custom jobs associated with a specific group ID
 *
 * @param {string} groupId - The ID of the group to fetch custom jobs for.
 * @param {Options} options - Optional parameters to filter custom jobs by livestream ID or spark ID.
 */
const useGroupCustomJobs = (groupId: string, options: Options = {}) => {
   const {
      livestreamId = "",
      sparkId = "",
      includePermanentlyExpired,
   } = options

   const collectionRef = query(
      collection(useFirestore(), "customJobs"),
      where("groupId", "==", groupId),
      ...(livestreamId
         ? [where("livestreams", "array-contains", livestreamId)]
         : []),
      ...(sparkId ? [where("sparks", "array-contains", sparkId)] : []),
      ...(includePermanentlyExpired
         ? []
         : [where("isPermanentlyExpired", "==", false)]),
      orderBy("createdAt", "desc")
   )

   const { data } = useFirestoreCollection<CustomJob>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   return data
}

export default useGroupCustomJobs
