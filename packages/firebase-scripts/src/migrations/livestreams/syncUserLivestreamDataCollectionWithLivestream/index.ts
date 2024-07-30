import { FieldValue } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import { throwMigrationError } from "../../../util/misc"

export async function run() {
   const counter = new Counter()
   try {
      const livestreamUserDatas =
         (await livestreamRepo.getAllUserLivestreamData(true)) || []

      const bulkWriter = firestore.bulkWriter()
      counter.addToReadCount(livestreamUserDatas.length)
      Counter.log(`Found ${livestreamUserDatas.length} UserLivestreamDatas`)

      counter.setCustomCount(
         counterConstants.totalNumDocs,
         livestreamUserDatas.length
      )
      loopProgressBar.start(livestreamUserDatas.length, 0)
      livestreamUserDatas.forEach((data, index) => {
         // @ts-ignore
         const ref = data.ref as firebase.firestore.DocumentReference
         const isLivestreamChild = ref.path.startsWith("livestreams")

         counter.setCustomCount(counterConstants.currentDocIndex, index)
         loopProgressBar.update(index + 1)
         const livestreamId = data.livestreamId
         const userEmail = data.user?.userEmail
         const hasParticipated = Boolean(data.participated?.date)
         const hasJoinedTalentPool = Boolean(data.talentPool?.date)
         const updateData = {
            // @ts-ignore
            talentPool: hasJoinedTalentPool
               ? FieldValue.arrayUnion(userEmail)
               : FieldValue.arrayRemove(userEmail),
            // @ts-ignore
            participatedUsers: hasParticipated
               ? FieldValue.arrayUnion(userEmail)
               : FieldValue.arrayRemove(userEmail),
         }

         if (livestreamId && isLivestreamChild) {
            const livestreamRef = firestore
               .collection("livestreams")
               .doc(livestreamId)
            bulkWriter
               .set(livestreamRef, updateData, { merge: true })
               .then(() => handleBulkWriterSuccess(counter))
               .catch((err) => handleBulkWriterError(err, counter))
            counter.writeIncrement()
         }
      })
      loopProgressBar.stop()

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
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
