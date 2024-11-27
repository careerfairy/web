import { Group } from "@careerfairy/shared-lib/groups"
import { collection, documentId, query, where } from "firebase/firestore"
import { MAX_QUERY_ARRAY_IN_LENGTH } from "../../constants/firebase"
import { FirestoreInstance } from "../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"

const empty = ["empty"]
/**
 * Returns a collection of group based on their IDs.
 * @param ids Array of group IDs to be fetched (max 10).
 * @returns Firestore collection containing interests.
 * @remarks If more than 10 IDs are passed, only the first 10 will be fetched.
 */
const useGroupsByIds = (ids: string[] = empty) => {
   const groupIds = ids?.length
      ? ids.slice(0, MAX_QUERY_ARRAY_IN_LENGTH)
      : empty

   return useFirestoreCollection<Group>(
      query(
         collection(FirestoreInstance, "careerCenterData"),
         where(documentId(), "in", groupIds)
      )
   )
}

export default useGroupsByIds
