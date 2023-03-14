import { livestreamTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
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
      ...getCLIBarOptions("Writing livestream stats batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

let livestreams: DataWithRef<true, LivestreamEvent>[]
const bulkWriter = firestore.bulkWriter()

export async function run() {
   try {
      Counter.log("Fetching all livestreams and groups")

      livestreams = await logAction(
         () => livestreamRepo.getAllLivestreams(false, true),
         "Fetching all livestreams"
      )
      counter.addToReadCount(livestreams.length)
      bar.start(livestreams.length, 0)

      await updateLivestreams()

      await bulkWriter.close()
      bar.stop()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const updateLivestreams = async () => {
   let idx = 0
   for (const livestream of livestreams) {
      const toUpdate: Pick<LivestreamEvent, "triGrams"> = {
         // we override the entire map on the destination document
         triGrams: livestreamTriGrams(livestream.title, livestream.company),
      }

      if (Object.keys(toUpdate.triGrams).length === 0) {
         // skip this update because there are no trigrams, odd right?
         counter.addToCustomCount(
            "livestream without title and company, no trigrams generated",
            1
         )
         bar.increment()
         continue
      }

      const docRef = firestore.collection("livestreams").doc(livestream.id)

      bulkWriter
         .set(docRef, toUpdate, { merge: true })
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

      // write in batches
      if (++idx % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }
   }
}
