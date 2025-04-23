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

interface UpdateDocumentsConfig {
   query: Query
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   updateData: Record<string, any>
   batchSize?: number
   waitTimeBetweenBatches?: number
   dryRun?: boolean
}

const FIELD_TO_ORDER_BY = "universityName"

// Configure your update here
const config: UpdateDocumentsConfig = {
   // Example: collection query
   query: firestore
      .collection("careerCenterData")
      // Keep this commented out for now as an example
      // .where(FIELD_TO_ORDER_BY, "!=", true)
      .orderBy(FIELD_TO_ORDER_BY, "desc"),
   updateData: { migrationTrigger: Date.now() },
   batchSize: 25,
   waitTimeBetweenBatches: 3_000,
   dryRun: false, // Set to false to run the migration
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

   console.log(`Total documents to process: ${totalDocumentsCounts}`)
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

         for (const doc of docs) {
            // Update current document index for progress tracking
            counter.customCountIncrement(counterConstants.currentDocIndex)

            if (!config.dryRun) {
               bulkWriter
                  .update(doc.ref, config.updateData)
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
            )}%)`
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
