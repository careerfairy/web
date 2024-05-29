import { CreatorRoles } from "@careerfairy/shared-lib/dist/groups/creators"
import * as cliProgress from "cli-progress"
import { BulkWriter, FieldValue, Timestamp } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

const WRITE_BATCH = 50
const counter = new Counter()
const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

export async function run() {
   try {
      const [livestreams, allCreators] = await Promise.all([
         logAction(
            () => livestreamRepo.getAllLivestreams(false, true),
            "Fetching live streams..."
         ),
         logAction(
            () => groupRepo.getAllCreators(true),
            "Fetching all creators..."
         ),
      ])

      Counter.log(
         `Fetched ${livestreams?.length} live streams and ${allCreators?.length} creators`
      )

      counter.addToReadCount(
         (livestreams?.length ?? 0) + (allCreators?.length ?? 0)
      )

      const livestreamsWithCreators = livestreams
         ?.filter((livestream) => livestream.creatorsIds?.length > 0)
         .map((livestream) => livestream.creatorsIds)
         .flat()

      const livestreamCreators = allCreators.filter((creator) =>
         livestreamsWithCreators.includes(creator.id)
      )

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(livestreamCreators.length, 0)

      await backfillCreatorRoles(allCreators, counter, bulkWriter)

      await bulkWriter.close()
      progressBar.stop()

      Counter.log("Finished backfilling live stream creators.")
   } catch (error) {
      console.log(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const backfillCreatorRoles = async (
   livestreamCreators,
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   loopProgressBar.start(livestreamCreators.length, 0)

   let index = 0
   for (const creator of livestreamCreators) {
      console.log(creator.id)

      bulkWriter
         .update(creator._ref, {
            roles: FieldValue.arrayUnion(CreatorRoles.Speaker),
            lastModifiedByScript: Timestamp.fromMillis(Date.now()),
         })
         .then(() => handleBulkWriterSuccess(counter))
         .catch((error) => {
            console.log(error)
            handleBulkWriterError(error, counter)
         })

      counter.writeIncrement()
      loopProgressBar.update(index + 1)

      if (index % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }

      index++
   }
   loopProgressBar.stop()
}
