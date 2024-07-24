import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { FieldValue } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"

const TARGET_LIVESTREAM_ID = "QVUGAmPHypoznuT5O8jr"

export async function run() {
   const counter = new Counter()
   try {
      Counter.log(`Targeting livestream: ${TARGET_LIVESTREAM_ID}`)

      // returns a collection of all the
      const statsSnap = await firestore
         .collection("livestreams")
         .doc(TARGET_LIVESTREAM_ID)
         .collection("participatingStats")
         .get()

      counter.addToReadCount(statsSnap.docs.length)
      Counter.log(
         `Found ${statsSnap.docs.length} participating stats documents`
      )

      const participatingEmails = statsSnap.docs.map((doc) => doc.id)
      Counter.log(
         `Extracted ${participatingEmails.length} participating emails`
      )

      const toUpdate: Pick<LivestreamEvent, "participatingStudents"> = {
         participatingStudents: FieldValue.arrayUnion(
            ...participatingEmails
         ) as unknown as string[],
      }

      Counter.log(
         `Updating livestream document with ${participatingEmails.length} participating students`
      )
      await firestore
         .collection("livestreams")
         .doc(TARGET_LIVESTREAM_ID)
         .update(toUpdate)

      Counter.log("Finished committing! ")
   } catch (error) {
      console.error("An error occurred during the migration:", error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}
