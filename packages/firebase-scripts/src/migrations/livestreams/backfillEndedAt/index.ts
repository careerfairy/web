import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import { exec } from "child_process"
import * as cliProgress from "cli-progress"
import { DocumentReference, Timestamp } from "firebase-admin/firestore"
import { promisify } from "util"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const execAsync = promisify(exec)
const WRITE_BATCH = 50

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing livestreams batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

let livestreams: DataWithRef<true, LivestreamEvent>[]
const bulkWriter = firestore.bulkWriter()

async function getVideoDuration(videoUrl: string): Promise<number> {
   try {
      // Use ffprobe to get video duration in seconds
      const { stdout } = await execAsync(
         `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoUrl}"`
      )
      return parseFloat(stdout.trim())
   } catch (error) {
      console.error("Error getting video duration:", error)
      return null
   }
}

export async function run() {
   try {
      Counter.log("Fetching all livestreams without endedAt")

      // Get all livestreams that don't have endedAt
      livestreams = await logAction(
         () => livestreamRepo.getAllLivestreams(false, true),
         "Fetching all livestreams"
      )

      // Filter livestreams that don't have endedAt and have either startedAt or start
      livestreams = livestreams.filter(
         (livestream) =>
            !livestream.endedAt && (livestream.startedAt || livestream.start)
      )

      console.log(`Found ${livestreams.length} livestreams to process`)

      bar.start(livestreams.length, 0)
      counter.addToReadCount(livestreams.length)

      await process()

      await bulkWriter.close()
      bar.stop()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

async function process() {
   let idx = 0
   for (const livestream of livestreams) {
      const docRef = livestream._ref

      try {
         // Get the recording token to get the sid
         const recordingToken =
            await livestreamRepo.getLivestreamRecordingToken(livestream.id)

         if (!recordingToken?.sid) {
            console.error(
               `No recording token found for livestream ${livestream.id}`
            )
            counter.addToCustomCount("noRecordingToken", 1)
            bar.increment()
            continue
         }

         // Use startedAt if available, otherwise use start
         const startTimestamp = livestream.startedAt || livestream.start

         const videoUrl = downloadLinkWithDate(
            startTimestamp.toDate(),
            livestream.id,
            recordingToken.sid
         )

         console.log(
            `Processing livestream ${livestream.id} (${idx + 1}/${
               livestreams.length
            })`
         )
         console.log(`Video URL: ${videoUrl}`)

         // Get the actual video duration in seconds
         const durationInSeconds = await getVideoDuration(videoUrl)

         if (!durationInSeconds) {
            console.error(
               `Could not get duration for livestream ${livestream.id}`
            )
            counter.addToCustomCount("failedToGetDuration", 1)
            bar.increment()
            continue
         }

         console.log(`Duration: ${durationInSeconds} seconds`)

         const startMillis = startTimestamp.toMillis()
         const durationMillis = Math.round(durationInSeconds) * 1000
         const endMillis = startMillis + durationMillis

         // Convert seconds to milliseconds and add to start timestamp
         const endedAt = new Timestamp(
            Math.floor(endMillis / 1000),
            (endMillis % 1000) * 1000000
         )

         console.log(`Calculated endedAt: ${endedAt.toDate().toISOString()}`)

         const toUpdate: Pick<LivestreamEvent, "endedAt"> = {
            endedAt,
         }

         bulkWriter
            .update(docRef as unknown as DocumentReference, toUpdate)
            .then(() => {
               counter.writeIncrement()
               console.log(`Successfully updated livestream ${livestream.id}`)
            })
            .catch((error) => {
               console.error("bulkWriter.set failed", error, livestream.id)
               counter.addToCustomCount(counterConstants.numFailedWrites, 1)
            })
            .finally(() => {
               bar.increment()
            })

         if (++idx % WRITE_BATCH === 0) {
            console.log(`Flushing batch ${idx / WRITE_BATCH}`)
            await bulkWriter.flush()
         }
      } catch (error) {
         console.error(`Error processing livestream ${livestream.id}:`, error)
         counter.addToCustomCount("processingErrors", 1)
         bar.increment()
      }
   }
}
