import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { RegisteredLivestreams } from "@careerfairy/shared-lib/dist/users"
import { Timestamp } from "firebase-admin/firestore"
import Counter from "../../lib/Counter"
import counterConstants from "../../lib/Counter/constants"
import { firestore } from "../../lib/firebase"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../util/bulkWriter"
import { logAction } from "../../util/logger"

export async function run() {
   const counter = new Counter()
   const bulkWriter = firestore.bulkWriter()

   try {
      // Query all userLivestreamData documents

      const userLivestreamDataSnapshot = await logAction(
         () => firestore.collectionGroup("userLivestreamData").get(),
         "Querying userLivestreamData documents"
      )

      const userLivestreamDataDocs = userLivestreamDataSnapshot.docs.map(
         (doc) => doc.data() as UserLivestreamData
      )

      counter.addToReadCount(userLivestreamDataDocs.length)
      Counter.log(
         `Found ${userLivestreamDataDocs.length} userLivestreamData documents`
      )

      const userRegistrations = new Map<string, Map<string, Timestamp>>()

      // Process userLivestreamData documents
      userLivestreamDataDocs.forEach((data) => {
         if (data.registered && data.registered.date && data.userId) {
            if (!userRegistrations.has(data.userId)) {
               userRegistrations.set(data.userId, new Map())
            }
            userRegistrations
               .get(data.userId)
               .set(data.livestreamId, data.registered.date)
         }
      })

      counter.setCustomCount(
         counterConstants.totalNumDocs,
         userRegistrations.size
      )

      const totalWrites = userRegistrations.size
      loopProgressBar.start(totalWrites, 0)

      let completedWrites = 0

      bulkWriter.onWriteResult(() => {
         completedWrites++
         loopProgressBar.update(completedWrites)
         counter.writeIncrement()
      })

      let index = 0
      for (const [userId, livestreams] of userRegistrations) {
         counter.setCustomCount(counterConstants.currentDocIndex, index)

         const docRef = firestore
            .collection("registeredLivestreams")
            .doc(userId)

         const user = userLivestreamDataDocs.find(
            (userData) => userData.user.authId === userId
         ).user

         if (!user) {
            console.error(`User ${userId} not found`)
            continue
         }

         const data: RegisteredLivestreams = {
            id: userId,
            user,
            registeredLivestreams: Object.fromEntries(livestreams),
            size: livestreams.size,
         }

         bulkWriter
            .set(docRef, data)
            .then(() => handleBulkWriterSuccess(counter))
            .catch((err) => handleBulkWriterError(err, counter))

         index++
      }

      await bulkWriter.close()
      loopProgressBar.stop()
      Counter.log("Finished processing")
   } catch (error) {
      console.error("Error:", error)
   } finally {
      counter.print()
   }
}
