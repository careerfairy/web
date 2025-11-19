import { LivestreamChapter } from "@careerfairy/shared-lib/src/livestreams"
import {
   CollectionGroup,
   DocumentReference,
   Query,
   UpdateData,
} from "firebase-admin/firestore"
import Counter from "../../lib/Counter"
import counterConstants from "../../lib/Counter/constants"
import { firestore } from "../../lib/firebase"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   writeProgressBar,
} from "../../util/bulkWriter"
import { logAction } from "../../util/logger"

/**
 * Base configuration shared by all query types
 * @param T - The type of the documents to update, defaults to unknown and useful when
 * applying a custom filter to the documents (when not possible via query).
 */
interface UpdateDocumentsConfigBase<T = unknown> {
   updateData:
      | UpdateData<T>
      | UpdateData<T & Record<string, unknown>>
      | ((data: T) => UpdateData<T> | UpdateData<T & Record<string, unknown>>)
   batchSize?: number
   waitTimeBetweenBatches?: number
   dryRun?: boolean
   customDataFilter?: (data: T) => boolean
}

/**
 * Configuration for regular Query-based updates
 */
interface UpdateDocumentsConfigQuery<T = unknown>
   extends UpdateDocumentsConfigBase<T> {
   type?: "query"
   query: Query
}

/**
 * Configuration for CollectionGroup-based updates
 */
interface UpdateDocumentsConfigCollectionGroup<T = unknown>
   extends UpdateDocumentsConfigBase<T> {
   type: "collection-group"
   collectionGroupName: string
   documentType: string
   /**
    * Optional function to add additional query constraints (where clauses, orderBy, etc.)
    * Receives the collectionGroup query (already filtered by documentType) and should return
    * a Query with additional constraints applied.
    *
    * @example
    * queryBuilder: (query) => query.where("status", "==", "active").orderBy("createdAt", "desc")
    */
   queryBuilder?: (query: Query) => Query
}

/**
 * Discriminated union for document update configuration
 * @param T - The type of the documents to update, defaults to unknown and useful when
 * applying a custom filter to the documents (when not possible via query).
 *
 * Use type "query" (or omit) for regular Query-based updates, or "collection-group" for
 * CollectionGroup queries across all subcollections with the same name.
 *
 * @param updateData - The data to update the documents with. When a @param T is provided,
 * the updateData will be typed accordingly. Not providing @param T can be useful when applying
 * only an update of a non-existing field, example migrationTrigger (Date.now()), which will
 * update with the current timestamp, thus not affecting the existing documents and allowing
 * onWriteTriggers to run with the latest data. Can be a function receiving the document data as a parameter and returns a partial of the document data.
 * @param batchSize - The batch size to use for the update, defaults to 1000.
 * @param waitTimeBetweenBatches - The wait time between batches, defaults to 5000ms.
 * @param dryRun - Allows test runs before updating documents.
 * @param customDataFilter - A custom filter to apply to the documents, when not possible via
 * query. Defaults to undefined.
 */
type UpdateDocumentsConfig<T = unknown> =
   | UpdateDocumentsConfigQuery<T>
   | UpdateDocumentsConfigCollectionGroup<T>

// Configure your update here - Leaving this here for reference of a query based update
// const queryConfig: UpdateDocumentsConfig<LivestreamEvent> = {
//    // Query for livestreams, excluding test livestreams
//    query: firestore
//       .collection("livestreams")
//       .where("groupIds", "array-contains", "i8NjOiRu85ohJWDuFPwo")
//       .orderBy("start", "desc"),
//    // Set livestreamType from legacy isPanel: panels => "panel", others => "livestream"
//    updateData: () => ({
//       livestreamType: "livestream",
//       migrationTrigger: Date.now(),
//    }),
//    batchSize: 200, // Increased batch size for faster processing
//    waitTimeBetweenBatches: 3_000, // Longer wait time to allow functions to process
//    dryRun: true, // Set to false to run the migration
// }

const config: UpdateDocumentsConfig<LivestreamChapter> = {
   type: "collection-group",
   collectionGroupName: "chapters",
   documentType: "livestreamChapter",
   updateData: {
      type: "generated",
      migrationTrigger: Date.now(),
   },
   batchSize: 200, // Batch size for processing chapters
   waitTimeBetweenBatches: 3_000, // Longer wait time to allow functions to process
   dryRun: false, // Set to false to run the migration
}

const getTotalDocumentCount = async (
   query: Query | CollectionGroup
): Promise<number> => {
   const totalDocumentsSnapshot = await query.count().get()
   return totalDocumentsSnapshot.data().count
}

const buildQuery = <T>(
   config: UpdateDocumentsConfig<T>
): Query | CollectionGroup => {
   if (config.type === "collection-group") {
      const collectionGroup = firestore.collectionGroup(
         config.collectionGroupName
      )
      // where() on CollectionGroup returns a Query, which is compatible for our use case
      let query = collectionGroup.where(
         "documentType",
         "==",
         config.documentType
      ) as Query

      // Apply additional query constraints if provided
      if (config.queryBuilder) {
         query = config.queryBuilder(query)
      }

      return query
   }
   return config.query
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function run<T = unknown>(
   migrationConfig: UpdateDocumentsConfig<T> = config as UpdateDocumentsConfig<T>
) {
   const counter = new Counter()
   const bulkWriter = firestore.bulkWriter()

   const query = buildQuery(migrationConfig)
   const totalDocumentsCount = await getTotalDocumentCount(query)

   // Set up counter for progress tracking
   counter.setCustomCount(counterConstants.totalNumDocs, totalDocumentsCount)
   counter.setCustomCount(counterConstants.currentDocIndex, 0)
   counter.setCustomCount(counterConstants.numSuccessfulWrites, 0)
   counter.setCustomCount(counterConstants.numFailedWrites, 0)

   const queryTypeLabel =
      migrationConfig.type === "collection-group"
         ? `collectionGroup: ${migrationConfig.collectionGroupName}`
         : "query"
   console.log(
      `Total documents to process: ${totalDocumentsCount} (${queryTypeLabel})`
   )

   if (migrationConfig.dryRun) {
      console.log("DRY RUN MODE: No documents will be updated")
   } else {
      writeProgressBar.start(totalDocumentsCount, 0)
   }

   try {
      let lastDoc = null
      let hasMoreDocs = true
      let processedDocuments = 0

      while (hasMoreDocs) {
         let batchQuery = query.limit(migrationConfig.batchSize ?? 1_000)

         if (lastDoc) {
            batchQuery = batchQuery.startAfter(lastDoc)
         }

         const snapshot = await logAction(
            () => batchQuery.get(),
            `Getting next page of documents`
         )

         if (snapshot.empty) {
            hasMoreDocs = false
            break
         }

         const docs = snapshot.docs
         processedDocuments += docs.length

         let skips = 0
         for (const doc of docs) {
            const docData = doc.data() as T

            if (
               migrationConfig.customDataFilter &&
               !migrationConfig.customDataFilter(docData)
            ) {
               skips++
               continue
            }

            // Update current document index for progress tracking
            counter.customCountIncrement(counterConstants.currentDocIndex)

            if (!migrationConfig.dryRun) {
               const updateData: UpdateData<T> =
                  typeof migrationConfig.updateData === "function"
                     ? (migrationConfig.updateData(docData) as UpdateData<T>)
                     : (migrationConfig.updateData as UpdateData<T>)

               // Cast needed: Firestore query results return DocumentReference<DocumentData, DocumentData>
               // (generic types aren't preserved), but bulkWriter.update() expects DocumentReference<unknown, T>.
               // This is safe because we control the query type through our config, and bulkWriter accepts
               // any DocumentReference at runtime.
               bulkWriter
                  .update(doc.ref as DocumentReference<unknown, T>, updateData)
                  .then(() => handleBulkWriterSuccess(counter))
                  .catch((err) => handleBulkWriterError(err, counter))
            } else {
               // In dry run mode, just increment success counter without actual updates
               counter.customCountIncrement(
                  counterConstants.numSuccessfulWrites
               )
            }
         }

         lastDoc = docs[docs.length - 1]

         // Log batch progress
         const progress = (processedDocuments / totalDocumentsCount) * 100
         console.log(
            `Processed ${processedDocuments} out of ${totalDocumentsCount} documents (${progress.toFixed(
               2
            )}%) - Skips: ${skips}`
         )

         if (!migrationConfig.dryRun) {
            await bulkWriter.flush()
         }

         await wait(migrationConfig.waitTimeBetweenBatches ?? 5000)
      }

      if (!migrationConfig.dryRun) {
         await bulkWriter.close()
         writeProgressBar.stop()
      }

      Counter.log(
         migrationConfig.dryRun ? "Finished dry run" : "Finished processing"
      )
   } catch (error) {
      console.error("Error:", error)
   } finally {
      counter.print()
   }
}
