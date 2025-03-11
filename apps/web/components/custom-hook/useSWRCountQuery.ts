import { getCountFromServer, Query } from "@firebase/firestore"
import { queryEqual } from "firebase/firestore"
import { ReactFireGlobals } from "reactfire"
import useSWR, { KeyedMutator, SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

const fetchCount = async (q: Query) => {
   try {
      const response = await getCountFromServer(q)
      return response.data().count
   } catch (error) {
      errorLogAndNotify(error)
      throw error
   }
}

/**
 * Global cache for Firestore queries to ensure unique identifiers for SWR keys.
 * This cache stores references to Firestore queries that have been made,
 * allowing for efficient re-use and deduplication of queries across the application.
 *
 * TODO: Move this to where the reactfire providers are initialized.
 */
const cachedQueries: Array<Query> =
   (globalThis as unknown as ReactFireGlobals)._reactFireFirestoreQueryCache ||
   []

// TODO: Move this to where the reactfire providers are initialized.
function getUniqueIdForFirestoreQuery(query: Query) {
   const index = cachedQueries.findIndex((cachedQuery) =>
      queryEqual(cachedQuery, query)
   )
   if (index > -1) {
      return index
   }

   return cachedQueries.push(query) - 1
}

export type CountQuery = {
   loading: boolean
   count: number | null
   error: Error | undefined
   refetch: KeyedMutator<number>
}

type Options = SWRConfiguration<number> & {
   disabled?: boolean
}

/**
 * Retrieves the count of documents matching a query.
 *
 * Leverages Firestore's getCountFromServer() alongside SWR for optimized data retrieval.
 * Executes an aggregation query, potentially reducing costs to 1/1000th of a standard read operation.
 * For further details on aggregation queries and their cost benefits, visit https://firebase.google.com/docs/firestore/pricing#aggregation_queries
 */
const useSWRCountQuery = (q: Query, options?: Options): CountQuery => {
   const mergedOptions: Options = {
      revalidateOnFocus: false,
      ...options,
      onError: (err) => {
         errorLogAndNotify(err, {
            message: "Error fetching count query",
            query: JSON.stringify(q),
         })
      },
   }

   const { data, error, isLoading, mutate } = useSWR(
      q && !options?.disabled
         ? ["countQuery", getUniqueIdForFirestoreQuery(q)]
         : null,
      () => fetchCount(q),
      mergedOptions
   )

   return {
      loading: isLoading,
      count: data,
      error,
      refetch: mutate,
   }
}

export default useSWRCountQuery
