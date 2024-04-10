import { getCountFromServer, Query } from "@firebase/firestore"
import { queryEqual } from "firebase/firestore"
import { ReactFireGlobals } from "reactfire"
import useSWR, { SWRConfiguration } from "swr"
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

/**
 * Count documents in a query
 *
 * This utilizes the Firestore getCountFromServer() feature combined with SWR for efficient data fetching.
 * It performs an aggregation query, which can be more cost-effective up to 1/1000th of a regular query.
 * Learn more about aggregation queries and their pricing at https://firebase.google.com/docs/firestore/pricing#aggregation_queries
 */
const useSWRCountQuery = (q: Query, options?: SWRConfiguration<number>) => {
   return useSWR(
      q ? ["countQuery", getUniqueIdForFirestoreQuery(q)] : null,
      () => fetchCount(q),
      options
   )
}

export default useSWRCountQuery
