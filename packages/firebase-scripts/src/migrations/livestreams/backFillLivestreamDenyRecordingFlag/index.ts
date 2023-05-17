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

async function process() {
   let idx = 0
   for (const livestream of livestreams) {
      const docRef = livestream._ref

      if ("denyRecordingAccess" in livestream) {
         // skip livestreams that already have the denyRecordingAccess field
         counter.addToCustomCount("livestreamsSkipped", 1)
         bar.increment()
         continue
      }

      const toUpdate: Pick<LivestreamEvent, "denyRecordingAccess"> = {
         denyRecordingAccess: false,
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
