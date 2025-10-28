import {
   ProfileLanguage,
   getHighestProficiencyLanguageCode,
} from "@careerfairy/shared-lib/src/users/users"
import { BulkWriter } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import { writeProgressBar } from "../../../util/bulkWriter"
import { throwMigrationError } from "../../../util/misc"

const counter = new Counter()

const BATCH_SIZE = 200
const DRY_RUN = false

export async function run() {
   const bulkWriter = firestore.bulkWriter()

   try {
      Counter.log(
         "Starting cursor-based pagination for highestProficiencyLanguageCode backfill"
      )

      await backfillHighestLanguageWithPagination(bulkWriter)

      Counter.log("Closing bulkWriter...")
      await bulkWriter.close()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

/**
 * Processes users in batches using cursor-based pagination to avoid loading
 * all users into memory at once.
 */
const backfillHighestLanguageWithPagination = async (
   bulkWriter: BulkWriter
) => {
   let lastDoc = null
   let processedCount = 0

   // Get total count for progress tracking
   const countSnapshot = await firestore.collection("userData").count().get()
   const totalUsers = countSnapshot.data().count

   writeProgressBar.start(totalUsers, 0)

   let hasMore = true

   while (hasMore) {
      let query = firestore
         .collection("userData")
         .orderBy("id")
         .limit(BATCH_SIZE)

      // Start after last document for pagination
      if (lastDoc) {
         query = query.startAfter(lastDoc)
      }

      const usersSnapshot = await query.get()

      if (usersSnapshot.empty) {
         hasMore = false
         break
      }

      for (const userDoc of usersSnapshot.docs) {
         processedCount++

         const userId = userDoc.id

         // Fetch user's languages subcollection
         const languagesSnap = await firestore
            .collection("userData")
            .doc(userId)
            .collection("languages")
            .get()

         const languages: ProfileLanguage[] = languagesSnap.empty
            ? []
            : languagesSnap.docs.map((d) => d.data() as ProfileLanguage)

         const highestCode = getHighestProficiencyLanguageCode(languages)

         counter.addToReadCount(1)

         if (DRY_RUN) {
            console.log(
               `[DRY_RUN] user=${userId} highestProficiencyLanguageCode=${highestCode}`
            )
            continue
         }

         // Prepare update for user document using bulkWriter
         const userRef = firestore.collection("userData").doc(userId)
         bulkWriter
            .update(userRef, {
               highestProficiencyLanguageCode: highestCode,
            })
            .then(() => {
               counter.writeIncrement()
            })
            .catch((error) => {
               console.error(
                  `bulkWriter.update failed for user ${userId}:`,
                  error
               )
               counter.addToCustomCount(counterConstants.numFailedWrites, 1)
            })

         counter.addToWriteCount(1)
      }

      // Flush bulkWriter after processing this batch
      await bulkWriter.flush()

      // Update progress bar
      writeProgressBar.start(totalUsers, processedCount)

      // Update cursor for next iteration
      lastDoc = usersSnapshot.docs[usersSnapshot.docs.length - 1]

      // Stop if we got fewer docs than batch size (last page)
      if (usersSnapshot.docs.length < BATCH_SIZE) {
         hasMore = false
      }
   }

   writeProgressBar.stop()
   Counter.log(
      `Backfill complete for highestProficiencyLanguageCode. Processed ${processedCount} users.`
   )
}
