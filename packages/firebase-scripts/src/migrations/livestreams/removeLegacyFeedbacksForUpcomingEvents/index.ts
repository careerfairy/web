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
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
const cliProgress = require("cli-progress")

let allFutureLivestreams: Record<
   string,
   DataWithRef<true, LivestreamEvent>
> = {}
let allFutureLivestreamsArray: DataWithRef<true, LivestreamEvent>[] = []
let allRatings: DataWithRef<true, EventRating>[] = []

const deleteProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Deleting depracted feedback ratings", "Deleted Ratings"),
   cliProgress.Presets.shades_classic
)

const addNewFeedbackProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Adding new feedback ratings", "Added Ratings"),
   cliProgress.Presets.shades_classic
)

// Ratings to be deleted only if exact match
const willApplyRating = {
   question: `Are you more likely to apply to thanks to this live stream?`,
   // question: `Are you more likely to apply to ${livestream.company} thanks to this live stream?`, // original question
   id: "willApply",
   appearAfter: 40,
   hasText: false,
} as const satisfies EventRating

const overallRating = {
   question:
      "How would you rate this live stream experience? Any feedback you would like to share?",
   id: "overall",
   appearAfter: 45,
   hasText: true,
} as const satisfies EventRating

const createNewFeedbackToAdd = (livestream: LivestreamEvent) =>
   ({
      question: `Help ${livestream.company} to improve: How can they make the experience more useful to you and other students?`,
      appearAfter: 40,
      id: "companyFeedback",
      hasText: true,
      noStars: true,
      isSentimentRating: false,
      isForEnd: false,
   } as const satisfies EventRating)

export async function run() {
   const counter = new Counter()
   try {
      ;[allFutureLivestreams, allRatings] = await logAction(
         () =>
            Promise.all([
               livestreamRepo
                  .getAllFutureLivestreams(false, true)
                  .then((streams) => {
                     allFutureLivestreamsArray = streams
                     counter.addToReadCount(streams.length)
                     return convertDocArrayToDict(streams)
                  }),
               livestreamRepo.getAllRatings(),
            ]),
         "Fetching livestreams"
      )

      counter.setCustomCount(
         "Future livestreams",
         allFutureLivestreamsArray.length
      )
      counter.setCustomCount("Ratings", allRatings.length)
      counter.addToReadCount(allRatings.length)

      let batchSize = 200 // Batch size for firestore, 200 or fewer works consistently
      const totalNumDocs = allRatings.length
      deleteProgressBar.start(totalNumDocs, 0)

      for (let i = 0; i < totalNumDocs; i += batchSize) {
         const slicedRatings = allRatings.slice(i, i + batchSize) // Slice the data into batches
         const batch = firestore.batch()

         for (const rating of slicedRatings) {
            deleteProgressBar.increment()

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
                  counter.customCountIncrement("Deleted overall rating")
                  counter.customCountIncrement("Deletions")
                  continue
               }

               if (
                  rating.id === willApplyRating.id &&
                  rating.appearAfter === willApplyRating.appearAfter &&
                  rating.hasText === willApplyRating.hasText &&
                  // check if all words in question are included in rating.question as it has a dynamic company name
                  /^Are you more likely to apply to .+ thanks to this live stream\?$/.test(
                     rating.question
                  )
               ) {
                  // delete rating
                  batch.delete(rating._ref as any)
                  counter.writeIncrement()
                  counter.customCountIncrement("Deleted willApply rating")
                  counter.customCountIncrement("Deletions")
                  continue
               }
            }
         }

         await batch.commit()
      }
      deleteProgressBar.stop()

      // Add new feedback to all future livestreams
      // loop through all future livestreams

      const totalNumLivestreams = allFutureLivestreamsArray.length
      addNewFeedbackProgressBar.start(totalNumLivestreams, 0)

      for (let i = 0; i < totalNumLivestreams; i += batchSize) {
         const slicedLivestreams = allFutureLivestreamsArray.slice(
            i,
            i + batchSize
         ) // Slice the data into batches
         const batch = firestore.batch()

         for (const livestream of slicedLivestreams) {
            addNewFeedbackProgressBar.increment()
            const newFeedback = createNewFeedbackToAdd(livestream)
            const newFeedbackRef = livestream._ref
               .collection("rating")
               .doc(newFeedback.id)

            // set new feedback
            batch.set(newFeedbackRef as any, newFeedback, { merge: true })
            counter.writeIncrement()
            counter.customCountIncrement("Added new feedback")
         }

         await batch.commit()
      }
      addNewFeedbackProgressBar.stop()

      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
