import { groupTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import Counter from "../../../lib/Counter"
import { livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { firestore } from "../../../lib/firebase"
import * as cliProgress from "cli-progress"
import { DataWithRef } from "../../../util/types"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { backfillTrigrams } from "../../../util/trigrams"

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
      await backfillTrigrams<typeof livestreams[number]>(
         livestreams,
         ["title", "company"],
         counter,
         bar,
         bulkWriter,
         groupTriGrams,
         "livestreams"
      )
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
