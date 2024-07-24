import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
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

const TARGET_LIVESTREAM_ID = "QVUGAmPHypoznuT5O8jr"

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

      updateLivestreamWithParticipants(participatingEmails, bulkWriter)

      markUsersAsParticipated(participatingEmails, bulkWriter)

      await bulkWriter.close()

      Counter.log("Finished committing! ")
   } catch (error) {
      console.error("An error occurred during the migration:", error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const updateLivestreamWithParticipants = async (
   participantEmails: string[],
   bulkWriter: BulkWriter
) => {
   const livestreamUpdate: Pick<LivestreamEvent, "participatingStudents"> = {
      participatingStudents: FieldValue.arrayUnion(
         ...participantEmails
      ) as unknown as string[],
   }

   Counter.log(
      `Updating live stream document with ${participantEmails.length} participating students`
   )
   const livestreamRef = firestore
      .collection("livestreams")
      .doc(TARGET_LIVESTREAM_ID)

   bulkWriter.update(livestreamRef, livestreamUpdate)
}

const markUsersAsParticipated = async (
   participantEmails: string[],
   bulkWriter: BulkWriter
) => {
   progressBar.start(participantEmails.length, 0)

   participantEmails.forEach((email) => {
      const userLivestreamDataRef = firestore
         .collection("livestreams")
         .doc(TARGET_LIVESTREAM_ID)
         .collection("userLivestreamData")
         .doc(email)

      const userParticipationUpdate: Pick<UserLivestreamData, "participated"> =
         {
            participated: {
               date: FieldValue.serverTimestamp() as unknown as Timestamp,
            },
         }

      bulkWriter
         .update(userLivestreamDataRef, userParticipationUpdate)
         .catch(console.error)

      progressBar.increment()
   })

   progressBar.stop()
}
