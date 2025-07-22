import { type FirestoreDataConverter } from "@google-cloud/firestore"
import { Query } from "firebase-admin/firestore"
import functions = require("firebase-functions")

export const createAdminConverter = <T>(): FirestoreDataConverter<T> => ({
   toFirestore: (modelObject: T) => modelObject,
   fromFirestore: (snapshot) => {
      return {
         ...snapshot.data(),
         id: snapshot.id,
      } as T
   },
})

export const getCount = async (query: Query) => {
   const snap = await query.count().get()

   return snap.data()?.count ?? 0
}

/**
 * Generic pagination utility for processing large Firestore queries in batches
 * to avoid memory issues. Processes documents in chunks and accumulates results.
 *
 * @param baseQuery - The base Firestore query to paginate
 * @param batchSize - Number of documents to process per batch
 * @param processor - Function to process each batch and return a partial result
 * @param accumulator - Function to combine batch results into final result
 * @param initialValue - Initial value for the accumulator
 * @returns Promise<T> - The final accumulated result
 *
 * @example
 * // Count matching documents
 * const count = await paginateQuery(
 *    query,
 *    500,
 *    (docs) => docs.filter(doc => someCondition(doc.data())).length,
 *    (total, batchCount) => total + batchCount,
 *    0
 * )
 *
 * @example
 * // Collect IDs
 * const ids = await paginateQuery(
 *    query,
 *    500,
 *    (docs) => docs.map(doc => doc.id),
 *    (total, batchIds) => [...total, ...batchIds],
 *    []
 * )
 */
export async function paginateQuery<T, R>(
   baseQuery: Query,
   batchSize: number,
   processor: (docs: FirebaseFirestore.QueryDocumentSnapshot[]) => R,
   accumulator: (
      total: T,
      batchResult: R,
      batchInfo: { batchNumber: number; batchSize: number }
   ) => T,
   initialValue: T
): Promise<T> {
   let result = initialValue
   let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null
   let batchNumber = 0

   do {
      // Build paginated query
      let batchQuery = baseQuery.limit(batchSize)
      if (lastDoc) {
         batchQuery = batchQuery.startAfter(lastDoc)
      }

      const snapshot = await batchQuery.get()

      if (snapshot.empty) {
         break
      }

      // Process this batch
      const batchResult = processor(snapshot.docs)

      // Accumulate results
      batchNumber++
      result = accumulator(result, batchResult, {
         batchNumber,
         batchSize: snapshot.size,
      })

      // Update pagination cursor
      lastDoc = snapshot.docs[snapshot.docs.length - 1]

      // Log progress
      functions.logger.info(
         `Processed batch ${batchNumber}, batch size: ${snapshot.size}`
      )

      // Break if we got fewer docs than the batch size (last batch)
      if (snapshot.size < batchSize) {
         break
      }
   } while (lastDoc)

   return result
}
