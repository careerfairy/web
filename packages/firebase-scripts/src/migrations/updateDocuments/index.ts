import { Group } from "@careerfairy/shared-lib/src/groups"
import { Query } from "firebase-admin/firestore"
import Counter from "../../lib/Counter"
import counterConstants from "../../lib/Counter/constants"
import { firestore } from "../../lib/firebase"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   writeProgressBar,
} from "../../util/bulkWriter"
import { logAction } from "../../util/logger"

interface DefaultUpdateData {
   migrationTrigger: number
}

/**
 * @param T - The type of the documents to update, defaults to unknown and useful when
 * applying a custom filter to the documents (when not possible via query).
 *
 * @param query - The query to use to get the documents to update.
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
interface UpdateDocumentsConfig<T = unknown> {
   query: Query
   updateData:
      | Partial<{ [K in keyof T]: T[K] }>
      | ((data: T) => Partial<{ [K in keyof T]: T[K] }>)
      | DefaultUpdateData
   batchSize?: number
   waitTimeBetweenBatches?: number
   dryRun?: boolean
   customDataFilter?: (data: T) => boolean
}

const COLLECTION_NAME = "careerCenterData"
const FIELD_TO_ORDER_BY = "groupId"

// Configure your update here
const config: UpdateDocumentsConfig<Group> = {
   // Example: collection query
   query: firestore
      .collection(COLLECTION_NAME)
      // Keep this commented out for now as an example
      // .where(FIELD_TO_FILTER_BY, "!=", null)
      .orderBy(FIELD_TO_ORDER_BY, "desc"),
   updateData: {
      migrationTrigger: Date.now(),
   },
   batchSize: 100,
   waitTimeBetweenBatches: 2_000,
   dryRun: false, // Set to false to run the migration
   // customDataFilter: (group) => {
   //    return !group?.id?.length
   // },
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

   // Set up counter for progress tracking
   counter.setCustomCount(counterConstants.totalNumDocs, totalDocumentsCounts)
   counter.setCustomCount(counterConstants.currentDocIndex, 0)
   counter.setCustomCount(counterConstants.numSuccessfulWrites, 0)
   counter.setCustomCount(counterConstants.numFailedWrites, 0)

   console.log(
      `Total documents to process: ${totalDocumentsCounts} - ${COLLECTION_NAME}`
   )

   if (config.dryRun) {
      console.log("DRY RUN MODE: No documents will be updated")
   } else {
      writeProgressBar.start(totalDocumentsCounts, 0)
   }

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
               !config.customDataFilter(doc.data() as Group)
            ) {
               skips++
               continue
            }

            // Update current document index for progress tracking
            counter.customCountIncrement(counterConstants.currentDocIndex)

            if (!config.dryRun) {
               const updateData =
                  typeof config.updateData === "function"
                     ? config.updateData(doc.data() as Group)
                     : {
                          ...doc.data(),
                          ...config.updateData,
                       }

               bulkWriter
                  .update(doc.ref, updateData)
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
         const progress = (processedDocuments / totalDocumentsCounts) * 100
         console.log(
            `Processed ${processedDocuments} out of ${totalDocumentsCounts} documents (${progress.toFixed(
               2
            )}%) - Skips: ${skips}`
         )

         if (!config.dryRun) {
            await bulkWriter.flush()
         }

         await wait(config.waitTimeBetweenBatches ?? 5000)
      }

      if (!config.dryRun) {
         await bulkWriter.close()
         writeProgressBar.stop()
      }

      Counter.log(config.dryRun ? "Finished dry run" : "Finished processing")
   } catch (error) {
      console.error("Error:", error)
   } finally {
      counter.print()
   }
}
