import {
   Spark,
   SparkCategoriesToTagValuesMapper,
} from "@careerfairy/shared-lib/dist/sparks/sparks"
import * as cliProgress from "cli-progress"
import { BulkWriter } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

type SparkDataWithRef = DataWithRef<true, Spark>

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

// eslint-disable-next-line
export async function run() {
   try {
      const [allSparks] = await Promise.all([
         logAction(
            () => groupRepo.getAllSparks(true),
            "Fetching all sparks..."
         ),
      ])

      Counter.log(`Fetched ${allSparks?.length} sparks`)

      counter.addToReadCount(allSparks?.length ?? 0)

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(allSparks.length, 0)

      await cascadeCategoriesToContentTopicTags(allSparks, counter, bulkWriter)

      await bulkWriter.close()
      progressBar.stop()

      Counter.log("Finished backfilling sparks content topic tag ids.")
   } catch (error) {
      console.log(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeCategoriesToContentTopicTags = async (
   sparks: SparkDataWithRef[],
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   loopProgressBar.start(sparks.length, 0)

   let index = 0
   for (const spark of sparks) {
      console.log(spark.id)

      const sparkContentTopicTagsIds =
         [SparkCategoriesToTagValuesMapper[spark.category?.id]] ?? []

      bulkWriter
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         .update(spark._ref as any, {
            contentTopicsTagIds: sparkContentTopicTagsIds,
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
