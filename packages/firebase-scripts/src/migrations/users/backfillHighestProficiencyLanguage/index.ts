import {
   ProfileLanguage,
   getHighestProficiencyLanguageCode,
} from "@careerfairy/shared-lib/dist/users/users"
import { BulkWriter } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import {
   handleBulkWriterError,
   writeProgressBar,
} from "../../../util/bulkWriter"
import { throwMigrationError } from "../../../util/misc"

const counter = new Counter()

const BATCH_SIZE = 500
const DRY_RUN = false

// Custom counter keys for tracking
const customCountKeys = {
   usersWithLanguagesSubcollection: "Users with languages sub-collection",
   usersWithDeprecatedField: "Users using deprecated spokenLanguages fallback",
   usersWithNoLanguages: "Users with no language data",
}

/**
 * Helper function to extract the highest priority language from the deprecated
 * spokenLanguages field (which is just an array of language codes without proficiency).
 * Uses the same priority logic as getHighestProficiencyLanguageCode:
 * German > English > Alphabetical
 */
const getHighestLanguageFromDeprecatedField = (
   spokenLanguages: string[]
): string | null => {
   if (!spokenLanguages?.length) return null

   const getLanguagePriority = (languageId: string): number => {
      if (languageId === "de") return 0 // German has highest priority
      if (languageId === "en") return 1 // English has second priority
      return 2 // All other languages have lower priority
   }

   const sorted = [...spokenLanguages].sort((a, b) => {
      // Prioritize by language preference
      const priorityDiff = getLanguagePriority(a) - getLanguagePriority(b)
      if (priorityDiff !== 0) return priorityDiff

      // If both have same priority, sort lexicographically
      return a.localeCompare(b)
   })

   return sorted[0]
}

export async function run() {
   const bulkWriter = firestore.bulkWriter()

   try {
      Counter.log(
         "Starting cursor-based pagination for highestProficiencyLanguageCode backfill"
      )

      // Initialize failed writes counter
      counter.setCustomCount(counterConstants.numFailedWrites, 0)

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

      // Parallelize sub-collection fetches for all users in this batch
      const userProcessingPromises = usersSnapshot.docs.map(async (userDoc) => {
         const userId = userDoc.id
         const userData = userDoc.data()

         // Fetch user's top languages by proficiency (optimized query)
         // We fetch top 3 to handle potential ties at the highest proficiency level
         const languagesSnap = await firestore
            .collection("userData")
            .doc(userId)
            .collection("languages")
            .orderBy("proficiency", "desc")
            .limit(3)
            .get()

         const languages: ProfileLanguage[] = languagesSnap.empty
            ? []
            : languagesSnap.docs.map((d) => d.data() as ProfileLanguage)

         let highestCode = getHighestProficiencyLanguageCode(languages)

         // Track data source
         if (languages.length > 0) {
            counter.customCountIncrement(
               customCountKeys.usersWithLanguagesSubcollection
            )
         } else if (userData.spokenLanguages?.length) {
            // Fallback to deprecated spokenLanguages field if sub-collection is empty
            highestCode = getHighestLanguageFromDeprecatedField(
               userData.spokenLanguages
            )
            counter.customCountIncrement(
               customCountKeys.usersWithDeprecatedField
            )
         } else {
            counter.customCountIncrement(customCountKeys.usersWithNoLanguages)
         }

         counter.addToReadCount(1)

         if (DRY_RUN) {
            console.log(
               `[DRY_RUN] user=${userId} highestProficiencyLanguageCode=${highestCode}`
            )
            return
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
               handleBulkWriterError(error, counter)
            })

         counter.addToWriteCount(1)

         // Update progress bar after each user is processed
         processedCount++
         writeProgressBar.update(processedCount)
      })

      // Wait for all users in this batch to be processed
      await Promise.all(userProcessingPromises)

      // Flush bulkWriter after processing this batch
      await bulkWriter.flush()

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
