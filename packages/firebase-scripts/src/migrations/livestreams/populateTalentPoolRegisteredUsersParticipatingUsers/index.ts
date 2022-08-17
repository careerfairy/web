import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
import { throwMigrationError } from "../../../util/misc"
import { livestreamRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"
import {
   LivestreamEvent,
   LivestreamUserAction,
} from "@careerfairy/shared-lib/dist/livestreams"
import { FieldValue } from "firebase-admin/firestore"
import { getArgValue } from "../../../index"

export async function run() {
   const counter = new Counter()
   try {
      const targetBackfill = getArgValue<LivestreamUserAction>("userType")
      let livestreamUserDatas
      switch (targetBackfill) {
         case "talentPool":
            livestreamUserDatas =
               (await livestreamRepo.getAllLivestreamUsersByType(
                  "talentPool",
                  true
               )) || []
            break
         case "participated":
            livestreamUserDatas =
               (await livestreamRepo.getAllLivestreamUsersByType(
                  "participated",
                  true
               )) || []
            break
         case "registered":
            livestreamUserDatas =
               (await livestreamRepo.getAllLivestreamUsersByType(
                  "registered",
                  true
               )) || []
            break
         default:
            throwMigrationError(`Invalid user type: ${targetBackfill}`)
      }

      const bulkWriter = firestore.bulkWriter()
      counter.addToReadCount(livestreamUserDatas.length)
      Counter.log(
         `found ${livestreamUserDatas.length} userDatas for ${targetBackfill}`
      )

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
         const hasRegistered = Boolean(data.registered?.date)
         const hasParticipated = Boolean(data.participated?.date)
         const hasJoinedTalentPool = Boolean(data.talentPool?.date)
         let updateData: Partial<LivestreamEvent> = {}

         switch (targetBackfill) {
            case "talentPool":
               updateData = {
                  // @ts-ignore
                  talentPool: hasJoinedTalentPool
                     ? FieldValue.arrayUnion(userEmail)
                     : FieldValue.arrayRemove(userEmail),
               }
               break
            case "participated":
               updateData = {
                  // @ts-ignore
                  participatedUsers: hasParticipated
                     ? FieldValue.arrayUnion(userEmail)
                     : FieldValue.arrayRemove(userEmail),
               }
               break
            case "registered":
               updateData = {
                  // @ts-ignore
                  registeredUsers: hasRegistered
                     ? FieldValue.arrayUnion(userEmail)
                     : FieldValue.arrayRemove(userEmail),
               }
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
