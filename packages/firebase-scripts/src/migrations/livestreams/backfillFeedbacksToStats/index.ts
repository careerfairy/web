import {
   EventRating,
   EventRatingAnswer,
} from "@careerfairy/shared-lib/dist/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import { normalizeRating } from "@careerfairy/shared-lib/dist/livestreams/ratings"
import * as cliProgress from "cli-progress"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions } from "../../../util/misc"
import { DocRef } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { round } from "@careerfairy/shared-lib/dist/utils"
import counterConstants from "../../../lib/Counter/constants"

const WRITE_BATCH = 60
const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing livestream stats batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

const bulkWriter = firestore.bulkWriter()
export async function run() {
   const allRatings = await logAction(
      () => livestreamRepo.getAllRatings(),
      "Fetching all Ratings"
   )

   const allVotes = await logAction(
      () => livestreamRepo.getAllVotes(),
      "Fetching all Votes"
   )

   counter.addToReadCount(allRatings.length + allVotes.length)

   // aggregate the ratings & votes per livestream
   const data = normalizeRatings(allRatings, allVotes)

   bar.start(Object.keys(data).length, 0)

   let idx = 0
   for (const livestreamId of Object.keys(data)) {
      const statsToUpdate = handleLivestreamStats(data[livestreamId])

      if (Object.keys(statsToUpdate.ratings).length === 0) {
         // this livestream didn't have any rating votes, skip stats update
         counter.addToCustomCount("livestreamWithoutRatingVotes", 1)
         continue
      }

      updateLivestreamStats(livestreamId, statsToUpdate)

      // write in batches
      if (++idx % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }
   }

   await bulkWriter.close()
   bar.stop()
   counter.print()
}

type EventRatingWithRefs = EventRating & DocRef
type EventRatingAnswerWithRefs = EventRatingAnswer & DocRef

type Records = {
   [livstreamId: string]: InnerRecord
}

type InnerRecord = {
   id: string
   ratings: {
      [ratingId: string]: {
         doc: EventRatingWithRefs
         voters: EventRatingAnswerWithRefs[]
      }
   }
}

function normalizeRatings(
   allRatings: EventRatingWithRefs[],
   allVotes: EventRatingAnswerWithRefs[]
): Records {
   const data: Records = {}

   // insert ratings
   allRatings.forEach((rating) => {
      const pathSegments = rating._ref.path.split("/")

      if (pathSegments.length !== 4 || pathSegments[0] !== "livestreams") {
         // document from other collection? skip
         return
      }

      const livestreamId = pathSegments[1]

      // create livestream entry
      if (!data[livestreamId]) {
         data[livestreamId] = {
            id: livestreamId,
            ratings: {},
         }
      }

      // create rating inside livestream
      if (!data[livestreamId].ratings[rating.id]) {
         data[livestreamId].ratings[rating.id] = {
            doc: rating,
            voters: [],
         }
      }
   })

   // insert votes
   allVotes.forEach((vote) => {
      const pathSegments = vote._ref.path.split("/")

      if (
         pathSegments.length !== 6 ||
         pathSegments[0] !== "livestreams" ||
         pathSegments[2] !== "rating"
      ) {
         // document from other collection? skip
         return
      }

      const livestreamId = pathSegments[1]
      const ratingId = pathSegments[3]

      if (data[livestreamId]?.ratings[ratingId]) {
         data[livestreamId].ratings[ratingId].voters.push(vote)
      } else {
         counter.addToCustomCount("voteWithoutMatchingRatingId", 1)
         // console.log("No matching rating doc: " + vote._ref.path)
      }
   })

   return data
}

function handleLivestreamStats(record: InnerRecord) {
   const statsToUpdate: Pick<LiveStreamStats, "ratings"> = {
      ratings: {},
   }

   for (const ratingId of Object.keys(record.ratings)) {
      const rating = record.ratings[ratingId]

      if (rating.voters.length === 0) {
         // no votes? next rating question
         continue
      }

      const normalizedRatings = rating.voters
         .map((v) => normalizeRating(rating.doc, v))
         .filter((r) => r)

      const sum = normalizedRatings.reduce((acc, curr) => acc + curr, 0)
      const avg = round(sum / normalizedRatings.length, 1)

      // only insert the stats if we have ratings
      if (isNaN(avg) === false) {
         statsToUpdate.ratings[ratingId] = {
            numberOfRatings: normalizedRatings.length,
            averageRating: avg,
         }
      } else {
         counter.addToCustomCount("ratingQuestionWithoutVotes", 1)
      }
   }

   return statsToUpdate
}

function updateLivestreamStats(
   livestreamId: string,
   statsToUpdate: Partial<LiveStreamStats>
) {
   const statsRef = firestore
      .collection("livestreams")
      .doc(livestreamId)
      .collection("stats")
      .doc("livestreamStats")

   bulkWriter
      .set(statsRef, statsToUpdate, { merge: true })
      .then(() => {
         counter.writeIncrement()
      })
      .catch((error) => {
         console.error("bulkWriter.set failed", error, livestreamId)
         counter.addToCustomCount(counterConstants.numFailedWrites, 1)
      })
      .finally(() => {
         bar.increment()
      })
}
