import { pickPublicDataFromCreator } from "@careerfairy/shared-lib/dist/groups/creators"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { Spark } from "@careerfairy/shared-lib/src/sparks/sparks"
import * as cliProgress from "cli-progress"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

const counter = new Counter()
const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

export async function run() {
   try {
      const [creators, sparks, livestreams] = await logAction(
         () =>
            Promise.all([
               groupRepo.getAllCreators(false),
               groupRepo.getAllSparks(false),
               livestreamRepo.getAllLivestreams(false, false),
            ]),
         "Fetching all creators, sparks and livestreams"
      )

      Counter.log(
         `Fetched ${creators.length} creators, ${sparks.length} sparks and ${livestreams.length} livestreams`
      )

      counter.addToReadCount(
         creators.length + sparks.length + livestreams.length
      )

      const creatorsWithIdsUsingEmails = creators.filter((creator) =>
         creator.id.includes("@")
      )

      const bulkWriter = firestore.bulkWriter()
      progressBar.start(creatorsWithIdsUsingEmails.length, 0)

      let index = 0

      for (const creator of creatorsWithIdsUsingEmails) {
         // Generate a new Firestore ID
         const newId = firestore
            .collection("careerCenterData")
            .doc(creator.groupId)
            .collection("creators")
            .doc().id

         // Update the creator document with the new ID
         const newCreatorRef = firestore
            .collection("careerCenterData")
            .doc(creator.groupId)
            .collection("creators")
            .doc(newId)

         // Update the creator's ID
         creator.id = newId

         bulkWriter.set(newCreatorRef, creator)
         counter.writeIncrement()
         counter.addToCustomCount("creatorIdsUpdated", 1)

         // Delete the old creator document
         const oldCreatorRef = firestore
            .collection("careerCenterData")
            .doc(creator.groupId)
            .collection("creators")
            .doc(creator.email)

         bulkWriter.delete(oldCreatorRef)
         counter.writeIncrement()
         counter.addToCustomCount("creatorIdsDeleted", 1)

         // Update the embedded creator data in all sparks that reference this creator
         const sparksSnapshot = await firestore
            .collection("sparks")
            .where("creator.id", "==", creator.email)
            .get()

         counter.addToReadCount(sparksSnapshot.size)

         for (const sparkDoc of sparksSnapshot.docs) {
            // Update the spark document
            const sparkRef = firestore.collection("sparks").doc(sparkDoc.id)

            // Update the embedded creator data
            const toUpdate: Pick<Spark, "creator"> = {
               creator: pickPublicDataFromCreator(creator),
            }
            bulkWriter.update(sparkRef, toUpdate)

            counter.writeIncrement()
            counter.addToCustomCount("sparkCreatorIdsUpdated", 1)
         }

         // Update the creator's ID in all livestreams that reference this creator
         for (const livestream of livestreams) {
            if (livestream.creatorsIds?.includes(creator.email)) {
               const livestreamRef = firestore
                  .collection("livestreams")
                  .doc(livestream.id)

               const toUpdate: Pick<
                  LivestreamEvent,
                  "creatorsIds" | "speakers"
               > = {
                  creatorsIds:
                     livestream.creatorsIds?.map((id) =>
                        id === creator.email ? newId : id
                     ) || [],
                  speakers:
                     livestream.speakers?.map((speaker) => ({
                        ...speaker,
                        id: speaker.id === creator.email ? newId : speaker.id,
                     })) || [],
               }

               bulkWriter.update(livestreamRef, toUpdate)
               counter.writeIncrement()
               counter.addToCustomCount("livestreamCreatorIdsUpdated", 1)
            }
         }

         index++
         progressBar.update(index)
      }

      // Commit the bulkWriter
      await bulkWriter.close()
      progressBar.stop()
      Counter.log("BulkWriter committed")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
