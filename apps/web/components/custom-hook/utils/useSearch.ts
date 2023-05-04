import { useMemo, useState } from "react"
import {
   CollectionReference,
   limit,
   QueryConstraint,
} from "@firebase/firestore"
import { orderBy, query, where } from "firebase/firestore"
import { searchTriGrams } from "@careerfairy/shared-lib/utils/search"
import { useDebounce } from "react-use"
import { useFirestoreCollection } from "./useFirestoreCollection"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"

/**
 * A type for the emptyOrderBy option of the useSearch hook.
 * Specifies a field and direction to order the query by when there are no search constraints.
 * @template T - The type of the documents in the Firestore collection.
 */
type EmptyOrderByType<T> = {
   field: keyof T & string // The name of the field to order by
   direction: "asc" | "desc" // The direction to order the field by
}

export type UseSearchOptions<T> = {
   maxResults?: number
   debounceMs?: number
   emptyOrderBy?: EmptyOrderByType<T>
   additionalConstraints?: QueryConstraint[]
}

/**
 * A custom React hook used for performing searches of livestream events in Firestore.
 *
 * @param {string} inputValue - The search string input by the user
 * @param collectionRef - The collection reference to search
 * @param {UseSearchOptions} options - Additional options to apply to the search
 * @param {number} options.maxResults - The maximum number of results to return (default: 5)
 * @param {number} options.debounceMs - The number of milliseconds to debounce the search (default: 500)
 */
export function useSearch<T extends Identifiable>(
   inputValue: string,
   collectionRef: CollectionReference,
   options: UseSearchOptions<T> = {
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

   const searchQuery = useMemo(() => {
      const searchConstraints: QueryConstraint[] = []

      const ngGrams = searchTriGrams(debouncedValue)

      ngGrams.forEach((name) => {
         searchConstraints.push(where(`triGrams.${name}`, "==", true))
      })

      let constraints: QueryConstraint[] = [
         ...searchConstraints,
         ...(options.additionalConstraints || []),
         limit(maxResults),
      ]

      // If there are no search constraints, we want to order the query by start date
      // due to firestore limitations we can only order the query when there are no trigrams
      if (searchConstraints.length === 0 && options.emptyOrderBy) {
         constraints.push(
            orderBy(options.emptyOrderBy.field, options.emptyOrderBy.direction)
         )
      }

      return query(collectionRef, ...constraints)
   }, [
      debouncedValue,
      options.additionalConstraints,
      options.emptyOrderBy,
      maxResults,
      collectionRef,
   ])

   return useFirestoreCollection<T>(searchQuery, {
      idField: "id",
      suspense: false,
   })
}

export default useSearch
