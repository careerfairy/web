import * as cliProgress from "cli-progress"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { fieldOfStudyRepo, livestreamRepo } from "../../../repositories"
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
      const [livestreams, allFieldsOfStudy] = await Promise.all([
         logAction(
            () => livestreamRepo.getAllLivestreams(false, true),
            "Fetching live streams..."
         ),
         logAction(
            () => fieldOfStudyRepo.getAllFieldsOfStudy(),
            "Fetching fields of study..."
         ),
      ])

      Counter.log(
         `Fetched ${livestreams?.length} live streams and ${allFieldsOfStudy?.length} fields of study`
      )

      counter.addToReadCount(
         (livestreams?.length ?? 0) + (allFieldsOfStudy?.length ?? 0)
      )

      const livestreamsWithAnyFieldOfStudy = livestreams?.filter(
         (livestream) =>
            !livestream.targetFieldsOfStudy ||
            livestream.targetFieldsOfStudy.length === allFieldsOfStudy.length
      )

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(livestreamsWithAnyFieldOfStudy.length, 0)

      await backfillAnyFieldOfStudy(
         livestreamsWithAnyFieldOfStudy,
         allFieldsOfStudy,
         counter,
         bulkWriter
      )

      await bulkWriter.close()
      progressBar.stop()

      Counter.log("Finished backfilling target fields of study.")
   } catch (error) {
      console.log(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const backfillAnyFieldOfStudy = async (
   livestreamsWithAnyFieldOfStudy,
   allFieldsOfStudy,
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   loopProgressBar.start(livestreamsWithAnyFieldOfStudy.length, 0)

   let index = 0
   for (const livestream of livestreamsWithAnyFieldOfStudy) {
      console.log(livestream.id)

      bulkWriter
         .update(livestream._ref, {
            targetFieldsOfStudy: allFieldsOfStudy,
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
