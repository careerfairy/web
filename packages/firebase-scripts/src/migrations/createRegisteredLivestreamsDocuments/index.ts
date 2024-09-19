import { FieldPath } from "firebase-admin/firestore"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   writeProgressBar,
} from "../../util/bulkWriter"
import { logAction } from "../../util/logger"

const BATCH_SIZE = 1_000
const TRIGGER_FIELD = "migrationTrigger"

const getTotalUserLivestreamDataCount = async () => {
   const totalUserLivestreamDataDocumentCountSnapshot = await firestore
      .collectionGroup("userLivestreamData")
      .count()
      .get()

   return totalUserLivestreamDataDocumentCountSnapshot.data().count
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function run() {
   const counter = new Counter()
   const bulkWriter = firestore.bulkWriter()

   let processedDocuments = 0

   const totalDocumentsCounts = await getTotalUserLivestreamDataCount()

   console.log(`Total userLivestreamData documents: ${totalDocumentsCounts}`)

   try {
      let lastDocPath = null
      let hasMoreDocs = true

      while (hasMoreDocs) {
         let query = firestore
            .collectionGroup("userLivestreamData")
            .orderBy(FieldPath.documentId())
            .limit(BATCH_SIZE)

         if (lastDocPath) {
            query = query.startAfter(lastDocPath)
         }

         const snapshot = await logAction(
            () => query.get(),
            "Getting next page of userLivestreamData documents"
         )

         if (snapshot.empty) {
            hasMoreDocs = false
            break
         }

         const docs = snapshot.docs
         processedDocuments += docs.length

         for (const doc of docs) {
            bulkWriter
               .update(doc.ref, {
                  [TRIGGER_FIELD]: Date.now(),
               })
               .then(() => handleBulkWriterSuccess(counter))
               .catch((err) => handleBulkWriterError(err, counter))
         }

         lastDocPath = docs[docs.length - 1].ref.path

         // Log batch progress
         const progress = (processedDocuments / totalDocumentsCounts) * 100
         console.log(
            `Processed ${processedDocuments} out of ${totalDocumentsCounts} documents (${progress.toFixed(
               2
            )}%)`
         )

         await bulkWriter.flush()
         await wait(5000)
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
