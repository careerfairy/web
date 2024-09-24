import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { BulkWriter, FieldValue, Timestamp } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"

import * as cliProgress from "cli-progress"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing userLivestreamData batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

const TARGET_LIVESTREAM_ID = "QVUGAmPHypoznuT5O8jr" // World bank event

export async function run() {
   const counter = new Counter()
   const bulkWriter = firestore.bulkWriter()
   try {
      Counter.log(`Targeting live stream: ${TARGET_LIVESTREAM_ID}`)

      // returns a collection of all the participating stats
      const participatingStatsSnapshot = await firestore
         .collection("livestreams")
         .doc(TARGET_LIVESTREAM_ID)
         .collection("participatingStats")
         .get()

      counter.addToReadCount(participatingStatsSnapshot.docs.length)

      Counter.log(
         `Found ${participatingStatsSnapshot.docs.length} participating stats documents`
      )

      const participatingEmails = participatingStatsSnapshot.docs.map(
         (doc) => doc.id
      )

      await markUsersAsParticipated(participatingEmails, bulkWriter, counter)

      await bulkWriter.close()

      Counter.log("Finished committing! ")
   } catch (error) {
      console.error("An error occurred during the migration:", error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const markUsersAsParticipated = async (
   participantEmails: string[],
   bulkWriter: BulkWriter,
   counter: Counter
) => {
   progressBar.start(participantEmails.length, 0)

   for (const email of participantEmails) {
      const userLivestreamDataRef = firestore
         .collection("livestreams")
         .doc(TARGET_LIVESTREAM_ID)
         .collection("userLivestreamData")
         .doc(email)

      const userExists = await userLivestreamDataRef.get()

      progressBar.increment()

      if (!userExists.exists) {
         continue
      }

      const userParticipationUpdate: Pick<UserLivestreamData, "participated"> =
         {
            participated: {
               date: FieldValue.serverTimestamp() as unknown as Timestamp,
            },
         }

      bulkWriter.update(userLivestreamDataRef, userParticipationUpdate).catch() // allow update to fail, maybe not all users have userLivestreamData document
      counter.writeIncrement()
   }

   progressBar.stop()
}
