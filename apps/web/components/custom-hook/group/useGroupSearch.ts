import { useMemo } from "react"
import { collection } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import useSearch, { UseSearchOptions } from "../utils/useSearch"
import { Group } from "@careerfairy/shared-lib/groups"

/**
 * A custom React hook used for performing searches of livestream events in Firestore.
 *
 * @param {string} inputValue - The search string input by the user
 * @param {Options} options - Additional options to apply to the search
 * @param {number} options.maxResults - The maximum number of results to return (default: 5)
 * @param {number} options.debounceMs - The number of milliseconds to debounce the search (default: 500)
 */
function useGroupSearch(inputValue: string, options: UseSearchOptions<Group>) {
   const collectionRef = useMemo(
      () => collection(FirestoreInstance, "careerCenterData"),
      []
   )

   return useSearch<Group>(inputValue, collectionRef, options)
}

export default useGroupSearch
