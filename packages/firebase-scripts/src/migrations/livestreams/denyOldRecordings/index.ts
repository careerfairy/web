import Counter from "../../../lib/Counter"
import { livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import * as cliProgress from "cli-progress"
import { DataWithRef } from "../../../util/types"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import counterConstants from "../../../lib/Counter/constants"

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

export async function run() {
   try {
      Counter.log("Fetching all livestreams")

      livestreams = await logAction(
         () => livestreamRepo.getAllLivestreams(false, true),
         "Fetching all livestreams"
      )
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

// 2023-01-27
const referenceDate = new Date(2023, 0, 27) // month is 0-indexed

async function process() {
   let idx = 0
   for (const livestream of livestreams) {
      const docRef = livestream._ref

      if (livestream?.start?.toMillis?.() > referenceDate.getTime()) {
         // skip livestreams that are in the future of the reference date
         counter.addToCustomCount("futureLivestreamsSkipped", 1)
         bar.increment()
         continue
      }

      const toUpdate: Pick<LivestreamEvent, "denyRecordingAccess"> = {
         denyRecordingAccess: true,
      }

      bulkWriter
         .update(docRef as any, toUpdate)
         .then(() => {
            counter.writeIncrement()
         })
         .catch((error) => {
            console.error("bulkWriter.set failed", error, livestream.id)
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
