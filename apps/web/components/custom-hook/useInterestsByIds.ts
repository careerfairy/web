import { useFirestoreCollection } from "./utils/useFirestoreCollection"
import { Interest } from "@careerfairy/shared-lib/interests"
import { collection, documentId, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../data/firebase/FirebaseInstance"

/**
 * Returns a collection of interests based on their IDs.
 * @param ids Array of interest IDs to be fetched (max 10).
 * @returns Firestore collection containing interests.
 * @remarks Firebase will throw an error with the "in" operator if the passed array is empty, so be sure to find a way to conditionally render this hook.
 */
const useInterestsByIds = (ids: string[]) => {
   return useFirestoreCollection<Interest>(
      query(
         collection(FirestoreInstance, "interests"),
         where(documentId(), "in", ids)
      )
   )
}

export default useInterestsByIds
