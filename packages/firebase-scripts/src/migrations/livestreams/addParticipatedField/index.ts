import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import {
   LiveStreamEventWithUsersLivestreamData,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import counterConstants from "../../../lib/Counter/constants"
import { BulkWriter } from "firebase-admin/firestore"

export async function run() {
   const counter = new Counter()
   try {
      Counter.log(
         "Fetching all the future livestreams and user livestream data"
      )

      const bulkWriter = firestore.bulkWriter()
      const livestreamWithUserLivestreamData =
         await livestreamRepo.getAllLivestreamsWithUserLivestreamDataAfterRelease(
            false,
            true
         )

      Counter.log(
         `Fetched ${livestreamWithUserLivestreamData.length} livestreams with UserLivestreamData`
      )
      counter.addToReadCount(livestreamWithUserLivestreamData.length)

      addParticipatedFieldToAllUserLivestreamData(
         livestreamWithUserLivestreamData,
         bulkWriter,
         counter
      )

      Counter.log("Committing all writes...")
      writeProgressBar.start(
         counter.write(),
         counter.getCustomCount(counterConstants.numSuccessfulWrites)
      )

      /*
       * Commits all enqueued writes and marks the BulkWriter instance as closed.
       * After calling close(), calling any method will throw an error.
       * Any retries scheduled as part of an onWriteError() handler will
       * be run before the close() promise resolves.
       * */
      await bulkWriter.close()
      writeProgressBar.stop()

      Counter.log("Finished committing! ")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const addParticipatedFieldToAllUserLivestreamData = (
   livestreamWithUserLivestreamData: LiveStreamEventWithUsersLivestreamData[],
   bulkWriter: BulkWriter,
   counter: Counter
) => {
   counter.setCustomCount(
      counterConstants.totalNumDocs,
      livestreamWithUserLivestreamData.length
   )
   loopProgressBar.start(livestreamWithUserLivestreamData.length, 0)

   // go through all the livestreams
   livestreamWithUserLivestreamData.forEach((stream, index) => {
      counter.setCustomCount(counterConstants.currentDocIndex, index)
      loopProgressBar.update(index + 1)

      // go through all the userLivestreamData of each livestream
      stream?.usersLivestreamData.map((userData) => {
         const ref = firestore
            .collection("livestreams")
            .doc(stream.id)
            .collection("userLivestreamData")
            .doc(userData.user.userEmail)

         // update only if there is no participated field on that user
         const toUpdate: UserLivestreamData = {
            participated: null,
            ...userData,
         }

         bulkWriter
            .set(ref, toUpdate, { merge: true })
            .then(() => handleBulkWriterSuccess(counter))
            .catch((e) => handleBulkWriterError(e, counter))
      })

      counter.writeIncrement()
   })

   loopProgressBar.stop()
}

const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}
