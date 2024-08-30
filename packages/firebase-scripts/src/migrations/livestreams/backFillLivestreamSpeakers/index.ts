import {
   LivestreamEvent,
   Speaker,
} from "@careerfairy/shared-lib/src/livestreams"

import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"

const RUNNING_VERSION = "0.1"
const counter = new Counter()

export async function run() {
   try {
      Counter.log(
         `Fetching all upcoming live streams: Adding groupId to all of its speakers - v${RUNNING_VERSION}`
      )

      const allFutureLivestreams = await logAction(
         () => livestreamRepo.getAllFutureLivestreams(true, false),
         "Fetching all upcoming live streams"
      )

      Counter.log(
         `Fetched ${allFutureLivestreams.length} Upcoming live streams`
      )

      counter.addToReadCount(allFutureLivestreams.length)

      await backfillLivestreamsSpeakers(allFutureLivestreams, "livestreams")

      const allDraftLivestreams = await logAction(
         () => livestreamRepo.getAllDraftLivestreams(),
         "Fetching all draft live streams"
      )

      Counter.log(`Fetched ${allDraftLivestreams.length} draft live streams`)

      counter.addToReadCount(allDraftLivestreams.length)

      await backfillLivestreamsSpeakers(allDraftLivestreams, "draftLivestreams")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const backfillLivestreamsSpeakers = async (
   livestreams: LivestreamEvent[],
   collection: "livestreams" | "draftLivestreams"
) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = livestreams
   const totalNumDocs = livestreams.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const livestreamsChunk = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      livestreamsChunk.forEach((livestream) => {
         writeProgressBar.increment() // Increment progress bar

         const livestreamRef = firestore
            .collection(collection)
            .doc(livestream.id)

         const updatedSpeakers: Speaker[] =
            livestream.speakers?.map((speaker) => {
               const updatedSpeaker: Speaker = {
                  ...speaker,
                  groupId: livestream.groupIds?.at(0) || null,
               }
               return updatedSpeaker
            }) || []

         const toUpdate: Pick<LivestreamEvent, "speakers"> = {
            speakers: updatedSpeakers,
         }

         batch.update(livestreamRef, toUpdate)
         counter.writeIncrement() // Increment write counter
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All batches committed! :)")
}
