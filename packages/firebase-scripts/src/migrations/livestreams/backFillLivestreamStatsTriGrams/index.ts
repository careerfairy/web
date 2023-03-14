import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import { livestreamTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import Counter from "../../../lib/Counter"
import { livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import * as cliProgress from "cli-progress"
import { DataWithRef } from "../../../util/types"
import counterConstants from "../../../lib/Counter/constants"

const WRITE_BATCH = 100
const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing livestream stats batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

let livestreamStats: DataWithRef<true, LiveStreamStats>[]
const bulkWriter = firestore.bulkWriter()

export async function run() {
   try {
      Counter.log("Fetching all livestreams and groups")

      livestreamStats = await logAction(
         () => livestreamRepo.getAllLivestreamStats(true),
         "Fetching all livestreams and groups"
      )
      counter.addToReadCount(livestreamStats.length)

      await updateLivestreamStats()

      await bulkWriter.close()
      bar.stop()
      counter.print()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const updateLivestreamStats = async () => {
   let idx = 0
   for (const livestreamStat of livestreamStats) {
      const toUpdate: Partial<LiveStreamStats> = {}
      toUpdate.triGrams = livestreamTriGrams(livestreamStat.livestream)

      if (Object.keys(toUpdate.triGrams).length === 0) {
         // skip this update because there are no tri-grams
         continue
      }

      bulkWriter
         .set(livestreamStat._ref as any, toUpdate, { merge: true })
         .then(() => {
            counter.writeIncrement()
         })
         .catch((error) => {
            console.error("bulkWriter.set failed", error, livestreamStat.id)
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
