import { Query } from "firebase-admin/firestore"
import Counter from "../../lib/Counter"
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
}

const FIELD_TO_ORDER_BY = "test"

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
   waitTimeBetweenBatches: 5_000,
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

   console.log(`Total documents to process: ${totalDocumentsCounts}`)

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
            bulkWriter
               .update(doc.ref, config.updateData)
               .then(() => handleBulkWriterSuccess(counter))
               .catch((err) => handleBulkWriterError(err, counter))
         }

         lastDoc = docs[docs.length - 1]

         // Log batch progress
         const progress = (processedDocuments / totalDocumentsCounts) * 100
         console.log(
            `Processed ${processedDocuments} out of ${totalDocumentsCounts} documents (${progress.toFixed(
               2
            )}%)`
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
