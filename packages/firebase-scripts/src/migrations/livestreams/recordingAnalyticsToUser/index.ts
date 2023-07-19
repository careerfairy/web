import Counter from "../../../lib/Counter"
import { livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import * as cliProgress from "cli-progress"
import {
   RecordingStatsUser,
   LivestreamRecordingDetails,
} from "@careerfairy/shared-lib/dist/livestreams"
import counterConstants from "../../../lib/Counter/constants"
import { Create } from "@careerfairy/shared-lib/dist/commonTypes"

const WRITE_BATCH = 50

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing new user recording stats batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

let recordingStats: LivestreamRecordingDetails[]
let recordingStatsUser: RecordingStatsUser[]
const bulkWriter = firestore.bulkWriter()

export async function run() {
   try {
      ;[recordingStats, recordingStatsUser] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreamRecordingStats(),
               livestreamRepo.getAllLivestreamUserRecordingStats(),
            ]),
         "Fetching all recording stats and user recording stats"
      )

      recordingStats = recordingStats ?? []
      recordingStatsUser = recordingStatsUser ?? []

      Counter.log(
         `Fetched ${recordingStats.length} recordingStats, ${recordingStatsUser.length} recordingStatsUser`
      )

      // fan out writes, assuming average of 35 viewers per recording
      bar.start(recordingStats.length * 35, 0)

      counter.addToReadCount(recordingStats.length + recordingStatsUser.length)

      await process()

      await bulkWriter.close()
      bar.stop()
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

// global counter for the number of writes
let idx = 0

async function process() {
   for (const recordingStat of recordingStats) {
      const totalUsers =
         (recordingStat.viewers?.length ?? 0) +
         (recordingStat.viewersThroughCredits?.length ?? 0)

      const perUserMinutes = Math.round(
         recordingStat.minutesWatched / totalUsers
      )

      // find users that don't have a new user recording stat document yet
      // to prevent counting the minutes twice
      const viewersWithoutExistingUserStat =
         recordingStat.viewers?.filter(
            (id) =>
               !userHasExistingRecordingStat(id, recordingStat.livestreamId)
         ) || []

      const viewersThroughCreditsWithoutExistingUserStat =
         recordingStat.viewersThroughCredits?.filter(
            (id) =>
               !userHasExistingRecordingStat(id, recordingStat.livestreamId)
         ) || []

      // create a new user recording stat document for each user
      const docsToCreate: CreateDocumentRecord[] = []

      viewersThroughCreditsWithoutExistingUserStat.forEach((id) => {
         docsToCreate.push(
            createRecordingStatsUserDocument(
               id,
               perUserMinutes,
               true,
               recordingStat
            )
         )
      })

      viewersWithoutExistingUserStat
         .filter((id) => {
            // confirm this user isn't in the list already
            return (
               viewersThroughCreditsWithoutExistingUserStat.indexOf(id) === -1
            )
         })
         .forEach((id) => {
            docsToCreate.push(
               createRecordingStatsUserDocument(
                  id,
                  perUserMinutes,
                  false,
                  recordingStat
               )
            )
         })

      // write all documents
      for (const [docId, doc] of docsToCreate) {
         bulkWriter
            .set(
               firestore
                  .collection("livestreams")
                  .doc(doc.livestreamId)
                  .collection("recordingStatsUser")
                  .doc(docId),
               doc,
               { merge: true }
            )
            .then(() => {
               counter.writeIncrement()
            })
            .catch((error) => {
               console.error(
                  "bulkWriter.set failed",
                  error,
                  doc.livestreamId,
                  docId
               )
               counter.addToCustomCount(counterConstants.numFailedWrites, 1)
            })
            .finally(() => {
               bar.increment()
            })

         if (++idx % WRITE_BATCH === 0) {
            await bulkWriter.flush()
         }
      }
   }
}

/**
 * Checks if a user already has a recordingStatsUser document for a livestream
 */
function userHasExistingRecordingStat(id: string, livestreamId: string) {
   return recordingStatsUser.some(
      (stat) => stat.userId === id && stat.livestreamId === livestreamId
   )
}

type CreateDocumentRecord = [string, Create<RecordingStatsUser>]

/**
 * Creates a new recordingStatsUser document for a user
 */
function createRecordingStatsUserDocument(
   userId: string,
   minutes: number,
   bought: boolean,
   recordingStat: LivestreamRecordingDetails
): CreateDocumentRecord {
   const watchedDate = createWatchedDateInTheFuture(
      recordingStat.livestreamStartDate.toDate()
   )

   const docId = `${userId}_${getNearestHourTimestamp(watchedDate)}`
   return [
      docId,
      {
         documentType: "recordingStatsUser",
         livestreamId: recordingStat.livestreamId,
         userId: userId,
         minutesWatched: minutes,
         recordingBought: bought,
         date: watchedDate as any,
         livestreamStartDate: recordingStat.livestreamStartDate.toDate() as any,
      },
   ]
}

/**
 * Creates a date that is one day in the future
 */
function createWatchedDateInTheFuture(date: Date) {
   const futureDate = new Date(date)
   futureDate.setDate(futureDate.getDate() + 1)
   return futureDate
}

function getNearestHourTimestamp(date?: Date) {
   const d = date ?? new Date()
   d.setMinutes(d.getMinutes() + 30)
   d.setMinutes(0, 0, 0)

   return d.getTime()
}
