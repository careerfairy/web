import Counter from "../../../lib/Counter"
import { groupRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"

const counter = new Counter()

export async function run() {
   try {
      Counter.log("Fetching all sparks and creators")

      const [creators, sparks] = await logAction(
         () =>
            Promise.all([groupRepo.getAllCreators(), groupRepo.getAllSparks()]),
         "Fetching all creators and sparks"
      )

      Counter.log(
         `Fetched ${creators.length} creators and ${sparks.length} sparks`
      )

      counter.addToReadCount(creators.length + sparks.length)

      const batch = firestore.batch()

      for (const creator of creators) {
         // Generate a new Firestore ID
         const newId = firestore.collection("_").doc().id

         // Update the creator's ID
         creator.id = newId

         // Update the creator document with the new ID
         const newCreatorRef = firestore
            .collection("careerCenterData")
            .doc(creator.groupId)
            .collection("creators")
            .doc(newId)
         batch.set(newCreatorRef, creator)

         // Delete the old creator document
         const oldCreatorRef = firestore
            .collection("careerCenterData")
            .doc(creator.groupId)
            .collection("creators")
            .doc(creator.email)
         batch.delete(oldCreatorRef)

         // Update the embedded creator data in all sparks that reference this creator
         const sparksSnapshot = await firestore
            .collection("sparks")
            .where("creator.id", "==", creator.email)
            .get()

         for (const sparkDoc of sparksSnapshot.docs) {
            const sparkData = sparkDoc.data()

            // Update the embedded creator data
            sparkData.creator = creator

            // Update the spark document
            const sparkRef = firestore.collection("sparks").doc(sparkDoc.id)
            batch.set(sparkRef, sparkData)
         }
      }

      // Commit the batch
      await batch.commit()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
