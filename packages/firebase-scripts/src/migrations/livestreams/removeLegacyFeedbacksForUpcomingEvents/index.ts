import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
import { livestreamRepo } from "../../../repositories"
import {
   EventRating,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { DataWithRef } from "../../../util/types"
import { logAction } from "../../../util/logger"
import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { writeProgressBar } from "../../../util/bulkWriter"

let allFutureLivestreams: Record<string, LivestreamEvent> = {}
let allRatings: DataWithRef<true, EventRating>[] = []

// Ratings to be deleted only if exact match
const willApplyRating = {
   question: `Are you more likely to apply to thanks to this live stream?`,
   // question: `Are you more likely to apply to ${livestream.company} thanks to this live stream?`, // original question
   id: "willApply",
   appearAfter: 40,
   hasText: false,
} as const satisfies EventRating

const willApplyWords = willApplyRating.question.split(" ")

const overallRating = {
   question:
      "How would you rate this live stream experience? Any feedback you would like to share?",
   id: "overall",
   appearAfter: 45,
   hasText: true,
} as const satisfies EventRating

export async function run() {
   const counter = new Counter()
   try {
      ;[allFutureLivestreams, allRatings] = await logAction(
         () =>
            Promise.all([
               livestreamRepo
                  .getAllLivestreams(false, false)
                  .then((streams) => {
                     counter.addToReadCount(streams.length)
                     return convertDocArrayToDict(streams)
                  }),
               livestreamRepo.getAllRatings(),
            ]),
         "Fetching livestreams"
      )

      counter.addToReadCount(allRatings.length)

      let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently
      const totalNumDocs = allRatings.length
      writeProgressBar.start(totalNumDocs, 0)

      for (let i = 0; i < totalNumDocs; i += batchSize) {
         const slicedRatings = allRatings.slice(i, i + batchSize) // Slice the data into batches
         const batch = firestore.batch()

         for (const rating of slicedRatings) {
            writeProgressBar.increment()

            const livestreamId = rating._ref.parent.parent?.id
            const isFutureRating = Boolean(allFutureLivestreams[livestreamId])

            if (isFutureRating) {
               // check if rating is an exact match to one of the ratings to be deleted

               if (
                  rating.id === overallRating.id &&
                  rating.question === overallRating.question &&
                  rating.appearAfter === overallRating.appearAfter &&
                  rating.hasText === overallRating.hasText
               ) {
                  // delete rating
                  batch.delete(rating._ref as any)
                  counter.writeIncrement()
                  continue
               }

               if (
                  rating.id === willApplyRating.id &&
                  rating.appearAfter === willApplyRating.appearAfter &&
                  rating.hasText === willApplyRating.hasText &&
                  // check if all words in question are included in rating.question as it has a dynamic company name
                  willApplyWords.every((word) => rating.question.includes(word))
               ) {
                  // delete rating
                  batch.delete(rating._ref as any)
                  counter.writeIncrement()
                  continue
               }
            }
         }

         await batch.commit()
      }

      writeProgressBar.stop()
      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}
