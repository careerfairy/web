import { CustomJob } from "@careerfairy/shared-lib/src/customJobs/customJobs"
import { Query } from "firebase-admin/firestore"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   writeProgressBar,
} from "../../util/bulkWriter"
import { logAction } from "../../util/logger"

/**
 * @param T - The type of the documents to update, defaults to unknown and useful when
 * applying a custom filter to the documents (when not possible via query).
 *
 * @param query - The query to use to get the documents to update.
 * @param updateData - The data to update the documents with. When a @param T is provided,
 * the updateData will be typed accordingly. Not providing @param T can be useful when applying
 * only an update of a non-existing field, example migrationTrigger (Date.now()), which will
 * update with the current timestamp, thus not affecting the existing documents and allowing
 * onWriteTriggers to run with the latest data.
 * @param batchSize - The batch size to use for the update, defaults to 1000.
 * @param waitTimeBetweenBatches - The wait time between batches, defaults to 5000ms.
 * @param dummyRun - By default the update is a dummy run, allowing test runs before updating
 * documents.
 * @param customDataFilter - A custom filter to apply to the documents, when not possible via
 * query. Defaults to undefined.
 */
interface UpdateDocumentsConfig<T = unknown> {
   query: Query
   updateData: Partial<{ [K in keyof T]: T[K] }>
   batchSize?: number
   waitTimeBetweenBatches?: number
   dummyRun?: boolean
   customDataFilter?: (data: T) => boolean
}

const DUMMY_RUN = true
const COLLECTION_NAME = "customJobs"
const FIELD_TO_ORDER_BY = "id"

// Configure your update here
const config: UpdateDocumentsConfig<CustomJob> = {
   // Example: collection query
   query: firestore
      .collection(COLLECTION_NAME)
      // Keep this commented out for now as an example
      // .where(FIELD_TO_FILTER_BY, "!=", null)
      .orderBy(FIELD_TO_ORDER_BY, "desc"),
   updateData: {
      deleted: true,
      // migrationTrigger: Date.now()
   },
   batchSize: 100,
   waitTimeBetweenBatches: 2_000,
   dummyRun: DUMMY_RUN,
   customDataFilter: (customJob) => {
      return typeof customJob?.deleted !== "boolean"
   },
}

const getTotalDocumentCount = async (query: Query) => {
   const totalDocumentsSnapshot = await query.count().get()
   return totalDocumentsSnapshot.data().count
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function run() {
   const counter = new Counter()
   const bulkWriter = firestore.bulkWriter()

   let processedDocuments = 0
   const totalDocumentsCounts = await getTotalDocumentCount(config.query)

   console.log(
      `Total documents to process: ${totalDocumentsCounts} - ${COLLECTION_NAME}`
   )

   try {
      let lastDoc = null
      let hasMoreDocs = true

      while (hasMoreDocs) {
         let query = config.query.limit(config.batchSize ?? 1_000)

         if (lastDoc) {
            query = query.startAfter(lastDoc)
         }

         const snapshot = await logAction(
            () => query.get(),
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
            if (
               config.customDataFilter &&
               !config.customDataFilter(doc.data() as CustomJob)
            ) {
               skips++
               continue
            }

            console.log(
               `Processing document ${doc.id} - ${doc.data()?.title} ${
                  config.dummyRun ? " - DUMMY RUN" : ""
               }`
            )

            if (!config.dummyRun) {
               bulkWriter
                  .update(doc.ref, config.updateData)
                  .then(() => handleBulkWriterSuccess(counter))
                  .catch((err) => handleBulkWriterError(err, counter))
            }
         }

         lastDoc = docs[docs.length - 1]

         // Log batch progress
         const progress = (processedDocuments / totalDocumentsCounts) * 100
         console.log(
            `Processed ${processedDocuments} out of ${totalDocumentsCounts} documents (${progress.toFixed(
               2
            )}%) - Skips: ${skips}`
         )

         await bulkWriter.flush()
         await wait(config.waitTimeBetweenBatches ?? 5000)
      }

      await bulkWriter.close()
      writeProgressBar.stop()
      Counter.log("Finished processing")
   } catch (error) {
      console.error("Error:", error)
   } finally {
      counter.print()
   }
}
