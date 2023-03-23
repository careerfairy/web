import { useMemo, useState } from "react"
import { limit, QueryConstraint } from "@firebase/firestore"
import { collection, query, where } from "firebase/firestore"
import { ngrams, normalize } from "@careerfairy/shared-lib/utils/search"
import { useDebounce } from "react-use"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"

type Options = {
   maxResults?: number
   debounceMs?: number
}

/**
 * A custom React hook used for performing searches of livestream events in Firestore.
 *
 * @param {string} inputValue - The search string input by the user
 * @param {QueryConstraint[]} additionalConstraints - Additional search constraints to apply
 * @param {Options} options - Additional options to apply to the search
 * @param {number} options.maxResults - The maximum number of results to return (default: 5)
 * @param {number} options.debounceMs - The number of milliseconds to debounce the search (default: 500)
 *
 */
export function useLivestreamSearch(
   inputValue: string,
   additionalConstraints: QueryConstraint[],
   options: Options = {
      maxResults: 5,
      debounceMs: 500,
   }
) {
   const [debouncedValue, setDebouncedValue] = useState("")

   const maxResults = options.maxResults || 5
   const debounceMs = options.debounceMs || 500

   useDebounce(
      () => {
         setDebouncedValue(inputValue)
      },
      debounceMs,
      [inputValue]
   )

   const livestreamQuery = useMemo(() => {
      const searchConstraints: QueryConstraint[] = []

      const ngGrams = ngrams(debouncedValue, 3)
         .map(normalize)
         .filter((gram) => gram.trim() !== "") // Filter out empty strings to prevent Firestore errors

      ngGrams.forEach((name) =>
         searchConstraints.push(where(`triGrams.${name}`, "==", true))
      )

      let constraints: QueryConstraint[] = [
         ...searchConstraints,
         ...additionalConstraints,
         limit(maxResults),
      ]

      return query(collection(FirestoreInstance, "livestreams"), ...constraints)
   }, [debouncedValue, additionalConstraints, maxResults])

   return useFirestoreCollection<LivestreamEvent>(livestreamQuery, {
      idField: "id",
      suspense: false,
   })
}
