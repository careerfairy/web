import { useMemo } from "react"
import { collection } from "firebase/firestore"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import useSearch, { UseSearchOptions } from "../utils/useSearch"

/**
 * A custom React hook used for performing searches of livestream events in Firestore.
 *
 * @param {string} inputValue - The search string input by the user
 * @param {Options} options - Additional options to apply to the search
 * @param {number} options.maxResults - The maximum number of results to return (default: 5)
 * @param {number} options.debounceMs - The number of milliseconds to debounce the search (default: 500)
 */
export function useLivestreamSearch(
   inputValue: string,
   options: UseSearchOptions<LivestreamEvent>
) {
   const collectionRef = useMemo(
      () => collection(FirestoreInstance, "livestreams"),
      []
   )

   return useSearch<LivestreamEvent>(inputValue, collectionRef, options)
}
